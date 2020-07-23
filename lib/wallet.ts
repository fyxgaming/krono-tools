const bsv = require('bsv-legacy');
import { Constants, Ecdsa, Hash, KeyPair, PrivKey, PubKey, Random, Sig } from 'bsv';
import { EventEmitter } from 'events';
import { RestBlockchain } from './rest-blockchain';
import { IAction, IJig, IStorage } from './interfaces';
import { PaymentRequired } from 'http-errors';

const fetch = require('node-fetch');
// import { Notifier } from './notifier';

export class Wallet extends EventEmitter {
    fetch = fetch;
    agent: any;
    private blockchain: RestBlockchain;

    pubkey: string;
    address: string;
    purse: string;
    handle?: string;
    private keyPair: KeyPair;
    private queue: Promise<any> = Promise.resolve();

    private processCount = 0;
    transaction: any;

    constructor(
        private apiUrl: string,
        private run: any,
        private storage?: IStorage<any>
    ) {
        super();
        Constants.Default = Object.assign({}, run.network === 'main' ? Constants.Mainnet : Constants.Testnet)
        this.blockchain = run.blockchain;

        const privKey = PrivKey.fromWif(run.owner.privkey);
        this.keyPair = KeyPair.fromPrivKey(privKey);

        this.purse = run.purse.address;
        this.pubkey = run.owner.pubkey;
        this.address = run.owner.address;
        this.transaction = run.transaction;
        console.log(`ADDRESS: ${this.address}`);
        console.log(`PUBKEY: ${this.pubkey}`);
        console.log(`PURSE: ${this.purse}`);
    }

    async initializeAgent(agentLoc: string, handle?: string) {
        console.log('AGENT:', agentLoc);
        const Agent = await this.run.load(agentLoc);
        this.agent = new Agent(this, this.blockchain);
        this.handle = handle;

        await this.addToQueue(() => this.agent.init(), 'init');
    }

    get balance(): Promise<number> {
        return this.run.purse.balance();
    }

    addToQueue(process: () => Promise<any>, label = 'process') {
        const processCount = this.processCount++;
        console.time(`${processCount}-${label}`);
        const queuePromise = this.queue.then(process);
        this.queue = queuePromise
            .catch(e => console.error('Queue error', label, e.message, e.stack))
            .then(() => console.timeEnd(`${processCount}-${label}`));

        return queuePromise;
    }

    scheduleHandler(delaySeconds: number, handlerName: string, payload?: any) {
        this.emit('schedule', delaySeconds, handlerName, payload);
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

    async verifySig(sig, hash, pubkey): Promise<boolean> {
        const msgHash = await Hash.asyncSha256(Buffer.from(hash));
        const verified = Ecdsa.verify(msgHash, Sig.fromString(sig), PubKey.fromString(pubkey));
        console.log('SIG:', verified, sig, hash, pubkey);
        return verified;
    }

    async signChannel(loc: string, seq?: number) {
        console.log('signChannel', loc, seq);
        // await this.transaction.pay();
        console.time(`sign:${loc}:${seq}`);
        await this.transaction.sign();
        console.timeEnd(`sign:${loc}:${seq}`);
        console.time(`export:${loc}:${seq}`);
        const tx = this.transaction.export();
        console.timeEnd(`export:${loc}:${seq}`);
        const input = tx.inputs.find(i => `${i.prevTxId.toString('hex')}_o${i.outputIndex}` === loc);
        if (!input) throw new Error('Invalid Channel');
        input.sequenceNumber = seq;
        console.time(`save:${loc}:${seq}`);
        await this.blockchain.saveChannel(loc, tx.toString());
        console.timeEnd(`save:${loc}:${seq}`);
        this.transaction.rollback();
    }

    private async finalizeTx(jig?: IJig) {
        try {
            if (jig && jig.KRONO_CHANNEL) {
                await this.signChannel(jig.KRONO_CHANNEL.loc, jig.KRONO_CHANNEL.seq);
                this.transaction.rollback();
                return;
            } else if (jig && this.transaction.actions.length) {
                this.transaction.end();
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
            } else this.transaction.rollback();
            return jig;
        } catch (e) {
            this.transaction.rollback();
            throw e;
        }
    }

    async runTransaction(work: () => Promise<IJig | undefined>) {
        try {
            this.transaction.begin();
            return this.finalizeTx(await work());
        } catch (e) {
            this.transaction.rollback();
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
            const tx = new bsv.Transaction(channel.rawtx);
            await this.transaction.import(tx);
            console.timeEnd(`import ${loc}`);

            const jig = this.transaction.actions
                .map(action => action.target)
                .find(jig => jig.KRONO_CHANNEL && jig.KRONO_CHANNEL.loc === loc);
            if (!jig) {
                console.log('No Jig:', loc)
                return;
            }
            return this.finalizeTx(await work(jig));
        } catch (e) {
            this.transaction.rollback();
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

    sync() {
        return this.run.sync();
    }
}
