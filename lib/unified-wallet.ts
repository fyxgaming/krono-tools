import { Bw, Ecdsa, Ecies, Hash, KeyPair, PubKey, Random, Sig } from 'bsv';
import { EventEmitter } from 'events';
import { RestBlockchain } from './rest-blockchain';
import { IAction, IJig, IStorage } from './interfaces';
import { PaymentRequired } from 'http-errors';
import { SignedMessage } from './signed-message';
import { RunTransaction } from './run-transaction';

const { Transaction } = require('bsv_legacy');
const fetch = require('node-fetch');
const MAGIC_BYTES = Buffer.from('Bitcoin Signed Message:\n');
const MAGIC_BYTES_PREFIX = Bw.varIntBufNum(MAGIC_BYTES.length);

export class Wallet extends EventEmitter {
    private blockchain: RestBlockchain;
    address: string;
    purse: string;
    private transaction: any;

    constructor(
        private paymail: string,
        private keyPair: KeyPair,
        private apiUrl: string,
        private run: any,
        private paymailClient: any
        // private storage?: IStorage<any>
    ) {
        super();
        this.blockchain = run.blockchain;
        this.purse = run.purse.address;
        this.address = run.owner.address;
        this.transaction = new RunTransaction(run, this.blockchain);
        console.log(`ADDRESS: ${this.address}`);
        console.log(`PURSE: ${this.purse}`);

        const protect: (string | number | symbol)[] = ['run', 'keyPair', 'finalizeTx', 'transaction'];
        return new Proxy(this, {
            get: (target, prop, receiver) => {
                if (protect.includes(prop)) return undefined;
                return Reflect.get(target, prop, receiver);
            },
            // TODO evaluate other traps
            getOwnPropertyDescriptor: (target, prop) => {
                if (protect.includes(prop)) return undefined;
                return Reflect.getOwnPropertyDescriptor(target, prop);
            }
        });
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

    // async submitAction(agentId: string, name: string, loc: string, msgHash: string, payload?: any) {
    //     const sig = Ecdsa.sign(Buffer.from(msgHash, 'hex'), this.keyPair).toString();
    //     const action: IAction = {
    //         name,
    //         loc,
    //         hash: msgHash,
    //         payload,
    //         sig
    //     };
    //     const resp = await fetch(`${this.apiUrl}/${agentId}/submit`, {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify(action)
    //     });
    //     if (!resp.ok) throw new Error(await resp.text());
    //     return resp.json();
    // }

    // async verifyMessage(message: SignedMessage) {
    //     const hashBuf = SignedMessage.hash(message);
    //     const { from, sig } = message;

    //     const pubkey = from.includes('@') ?
    //         await this.paymailClient.getPublicKey(from) :
    //         from;

    //     const verified = Ecdsa.verify(hashBuf, Sig.fromString(sig), PubKey.fromString(pubkey));
    //     return verified;
    // }

    async buildMessage(to: string[], subject: string, payload: string, sign = false, send = false): Promise<SignedMessage> {
        const ts = Date.now();
        const message = new SignedMessage({to, payload, subject, ts})
        if(sign) await message.sign(this.keyPair);
        if(send) await this.blockchain.sendMessage(message);
        return message;
    }

    async encrypt(pubkey: string) {

    }

    async decrypt(value) {

    } 

    async verifySig(sig, hash, pubkey): Promise<boolean> {
        const msgHash = await Hash.asyncSha256(Buffer.from(hash));
        const verified = Ecdsa.verify(msgHash, Sig.fromString(sig), PubKey.fromString(pubkey));
        console.log('SIG:', verified, sig, hash, pubkey);
        return verified;
    }

    async runTransaction(work: (t) => Promise<IJig | undefined>) {
        try {
            this.transaction.begin();
            await work(this.transaction);
        } catch (e) {
            throw e;
        } finally {
            this.transaction.rollback();
        }
    }

    async loadChannelTransaction(loc: string, seq: number, work: (t, jig: IJig) => Promise<IJig | undefined>) {
        try {
            console.time(`load channel ${loc}`);
            const channel = await this.blockchain.getChannel(loc)
                .catch(e => { if (e.status !== 404) throw e });
            console.timeEnd(`load channel ${loc}`);
            if (!channel || (seq && channel.seq !== seq)) return;

            console.time(`import ${loc}`);
            const tx = new Transaction(channel.rawtx);
            await this.transaction.import(tx);
            console.timeEnd(`import ${loc}`);

            const jig = this.transaction.actions
                .map(action => action.target)
                .find(jig => jig.KRONO_CHANNEL && jig.KRONO_CHANNEL.loc === loc);
            if (!jig) {
                console.log('No Jig:', loc)
                return;
            }
            // return this.finalizeTx(await work(this.run.transaction, jig));
            await work(this.transaction, jig);
        } catch (e) {
            throw e;
        } finally {
            this.transaction.rollback();
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


    // get(key) {
    //     if (!this.storage) throw new Error('Storage not implemented');
    //     return this.storage.get(key);
    // }

    // set(key: string, value: any) {
    //     if (!this.storage) throw new Error('Storage not implemented');
    //     return this.storage.set(key, value);
    // }

    // delete(key: string) {
    //     if (!this.storage) throw new Error('Storage not implemented');
    //     return this.storage.delete(key);
    // }

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
