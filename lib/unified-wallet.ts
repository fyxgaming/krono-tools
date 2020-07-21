import { Bw, Ecdsa, Hash, KeyPair, PubKey, Random, Sig } from 'bsv';
import { EventEmitter } from 'events';
import { RestBlockchain } from './rest-blockchain';
import { IAction, IJig, IStorage, ISignedMessage } from './interfaces';
import { PaymentRequired } from 'http-errors';

const { Transaction } = require('bsv_legacy');
const fetch = require('node-fetch');
const MAGIC_BYTES = Buffer.from('Bitcoin Signed Message:\n');
const MAGIC_BYTES_PREFIX = Bw.varIntBufNum(MAGIC_BYTES.length);

export class Wallet extends EventEmitter {
    private blockchain: RestBlockchain;
    address: string;
    purse: string;

    constructor(
        private paymail: string,
        private keyPair: KeyPair,
        private apiUrl: string,
        private run: any,
        private storage?: IStorage<any>
    ) {
        super();
        this.blockchain = run.blockchain;
        this.purse = run.purse.address;
        this.address = run.owner.address;
        console.log(`ADDRESS: ${this.address}`);
        console.log(`PURSE: ${this.purse}`);
    }

    get balance(): Promise<number> {
        return this.run.purse.balance();
    }

    async loadJigIndex() {
        console.time('jigIndex');
        const resp = await fetch(`${this.apiUrl}/jigs/${this.address}`);
        if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`);
        return resp.json();
    }

    async loadJig(loc: string): Promise<IJig> {
        console.time(`load ${loc}`);
        const jig = await this.run.load(loc).catch((e) => {
            if (e.message.includes('not a run tx') ||
                e.message.includes('not a jig output') ||
                e.message.includes('Not a token')
            ) {
                console.log('Not a jig:', loc);
                return;
            }
            console.error('Load error:', loc, e.message);
        });
        console.timeEnd(`load ${loc}`);
        return jig;
    }

    async loadJigs() {
        console.log('Load Jigs', this.address);
        const utxos = await this.blockchain.utxos(this.address);
        console.log('UTXOS:', utxos.length);
        const jigs: IJig[] = [];
        for (const utxo of utxos) {
            const loc = `${utxo.txid}_o${utxo.vout}`;
            const jig = await this.loadJig(loc);
            if (jig) jigs.push(jig);
        }
        console.log('JIGS:', jigs.length);
        return jigs;
    }

    async submitAction(agentId: string, name: string, loc: string, msgHash: string, payload?: any) {
        const sig = Ecdsa.sign(Buffer.from(msgHash, 'hex'), this.keyPair).toString();
        const action: IAction = {
            name,
            loc,
            hash: msgHash,
            payload,
            sig
        };
        const resp = await fetch(`${this.apiUrl}/${agentId}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(action)
        });
        if (!resp.ok) throw new Error(await resp.text());
        return resp.json();
    }

    async signMessage(payload: string): Promise<ISignedMessage> {
        const prefix = Bw.varIntBufNum(payload.length);
        const buf = Buffer.concat([MAGIC_BYTES_PREFIX, MAGIC_BYTES, prefix, Buffer.from(payload)]);
        const hashBuf = Hash.sha256Sha256(buf);
        return {
            paymail: this.paymail,
            payload,
            ts: Date.now(),
            sig: await Ecdsa.asyncSign(hashBuf, this.keyPair).toString()
        };
    }

    async verifySig(sig, hash, pubkey): Promise<boolean> {
        const msgHash = await Hash.asyncSha256(Buffer.from(hash));
        const verified = Ecdsa.verify(msgHash, Sig.fromString(sig), PubKey.fromString(pubkey));
        console.log('SIG:', verified, sig, hash, pubkey);
        return verified;
    }

    async signChannel(loc: string, seq?: number) {
        console.log('signChannel', loc, seq);
        console.time(`sign:${loc}:${seq}`);
        await this.run.transaction.sign();
        console.timeEnd(`sign:${loc}:${seq}`);
        console.time(`export:${loc}:${seq}`);
        const tx = this.run.transaction.export();
        console.timeEnd(`export:${loc}:${seq}`);
        const input = tx.inputs.find(i => `${i.prevTxId.toString('hex')}_o${i.outputIndex}` === loc);
        if (!input) throw new Error('Invalid Channel');
        input.sequenceNumber = seq;
        console.time(`save:${loc}:${seq}`);
        await this.blockchain.saveChannel(loc, tx.toString());
        console.timeEnd(`save:${loc}:${seq}`);
        this.run.transaction.rollback();
    }

    private async finalizeTx(jig?: IJig) {
        try {
            if (jig && jig.KRONO_CHANNEL) {
                await this.signChannel(jig.KRONO_CHANNEL.loc, jig.KRONO_CHANNEL.seq);
                this.run.transaction.rollback();
                return;
            } else if (jig && this.run.transaction.actions.length) {
                this.run.transaction.end();
                try {
                    console.log('syncing jig');
                    if (jig.sync) await jig.sync({ forward: false });
                } catch (e) {
                    console.error(e);
                    if (e.message.includes('Not enough funds')) {
                        throw new PaymentRequired();
                    }
                    throw e;
                }
            } else this.run.transaction.rollback();
            return jig;
        } catch (e) {
            this.run.transaction.rollback();
            throw e;
        }
    }

    async runTransaction(work: () => Promise<IJig | undefined>) {
        try {
            this.run.transaction.begin();
            return this.finalizeTx(await work());
        } catch (e) {
            this.run.transaction.rollback();
            throw e;
        }
    }

    async loadChannelTransaction(loc: string, seq: number, work: (jig: IJig) => Promise<IJig | undefined>) {
        try {
            console.time(`load channel ${loc}`);
            const channel = await this.blockchain.getChannel(loc)
                .catch(e => { if (e.status !== 404) throw e });
            console.timeEnd(`load channel ${loc}`);
            if (!channel || (seq && channel.seq !== seq)) return;

            console.time(`import ${loc}`);
            const tx = new Transaction(channel.rawtx);
            await this.run.transaction.import(tx);
            console.timeEnd(`import ${loc}`);

            const jig = this.run.transaction.actions
                .map(action => action.target)
                .find(jig => jig.KRONO_CHANNEL && jig.KRONO_CHANNEL.loc === loc);
            if (!jig) {
                console.log('No Jig:', loc)
                return;
            }
            return this.finalizeTx(await work(jig));
        } catch (e) {
            this.run.transaction.rollback();
            throw e;
        }
    }

    randomInt(max) {
        return Math.floor(Math.random() * (max || Number.MAX_SAFE_INTEGER));
    }

    randomBytes(size: number): string {
        return Random.getRandomBuffer(size).toString('hex');
    }

    timestamp() {
        return Date.now();
    }


    get(key) {
        if (!this.storage) throw new Error('Storage not implemented');
        return this.storage.get(key);
    }

    set(key: string, value: any) {
        if (!this.storage) throw new Error('Storage not implemented');
        return this.storage.set(key, value);
    }

    delete(key: string) {
        if (!this.storage) throw new Error('Storage not implemented');
        return this.storage.delete(key);
    }

    async cashout(address) {
        const utxos = await this.blockchain.utxos(this.run.purse.address);
        const tx = new Transaction()
            .from(utxos)
            .change(address)
            .sign(this.run.purse.privkey);
        await this.blockchain.broadcast(tx);
        // this.clientEmit('BalanceUpdated', await this.balance);
    }
}
