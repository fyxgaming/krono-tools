const bsv = require('bsv');
import { Ecdsa, Hash, KeyPair, PrivKey, PubKey, Random, Sig } from 'bsv2';
import { EventEmitter } from 'events';
import { Blockchain } from './blockchain';
import { IAction, IJig, IStorage } from './interfaces';
import { PaymentRequired } from 'http-errors';

const fetch = require('node-fetch');
// import { Notifier } from './notifier';

export class Wallet extends EventEmitter {
    fetch = fetch;
    agent: any;
    private blockchain: Blockchain;

    pubkey: string;
    address: string;
    purse: string;
    handle?: string;
    private keyPair: KeyPair;
    private queue: Promise<any> = Promise.resolve();

    private processCount = 0;
    transaction: any;

    constructor(
        private db,
        private apiUrl: string,
        private run: any,
        private storage?: IStorage<any>
    ) {
        super();
        this.blockchain = run.blockchain;

        if (run.network === 'main') {
            const privKey = new PrivKey.Mainnet().fromString(run.owner.privkey);
            this.keyPair = new KeyPair.Mainnet.fromPrivKey(privKey);
        } else {
            const privKey = new PrivKey.Testnet().fromString(run.owner.privkey);
            this.keyPair = KeyPair.Testnet.fromPrivKey(privKey);
        }
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

    async handleEvent(event, payload) {
        return await this.addToQueue(async () => {
            return this.agent.onEvent(event, payload);
        }, `callClientEvent: ${event}`);
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
        console.log('Load Jigs');
        const utxos = await this.blockchain.utxos(this.address);
        const jigs: IJig[] = [];
        for (const utxo of utxos) {
            const loc = `${utxo.txid}_o${utxo.vout}`;
            const jig = await this.loadJig(loc);
            if (jig) jigs.push(jig);
        }
        console.log('JIGS:', jigs.length);
        return jigs;
    }

    async loadChannel(loc: string, seq?: number) {
        console.time(`load channel ${loc}`);
        const channel = await this.blockchain.getChannel(loc);
        console.timeEnd(`load channel ${loc}`);
        if (!channel || (seq && channel.seq !== seq)) return;
        const tx = new bsv.Transaction(channel.rawTx);
        return this.loadTransaction(tx, loc);
    }

    async loadTransaction(tx, loc) {
        console.time(`import ${loc}`);
        await this.transaction.import(tx);
        console.timeEnd(`import ${loc}`);
        return this.transaction.actions
            .map(action => action.target)
            .find(jig => jig.KRONO_CHANNEL && jig.KRONO_CHANNEL.loc === loc);
    }

    async signChannel(loc, seq) {
        await this.transaction.pay();
        await this.transaction.sign();
        const tx = this.transaction.export();
        const input = tx.inputs.find(i => `${i.prevTxId.toString('hex')}_o${i.outputIndex}` === loc);
        if(!input) throw new Error('Invalid Channel');
        input.sequenceNumber = seq;
        await this.blockchain.saveChannel(loc, tx.toString());
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
        console.time('verify');
        const verified = Ecdsa.verify(msgHash, Sig.fromString(sig), PubKey.fromString(pubkey));
        console.timeEnd('verify');
        return verified;
    }

    private async finalizeTx(jig?: IJig) {
        if (this.transaction.actions.length) {
            this.transaction.end();
        } else {
            this.transaction.rollback();
        }
        try {
            await (jig ? jig.sync({ forward: false }) : this.run.sync());
        } catch (e) {
            if (e.message.includes('Not enough funds')) {
                throw new PaymentRequired();
            }
            throw e;
        }
        return jig;
    }

    async runTransaction(work: () => Promise<IJig | undefined>) {
        try {
            this.transaction.begin();
            let jig = await work();
            jig = await this.finalizeTx(jig);
            return jig;
        } catch (e) {
            this.transaction.rollback();
            throw e;
        }
    }

    async loadChannelTransaction(loc: string, seq: number, work: (jig: IJig) => Promise<IJig | undefined>) {
        try {
            let jig = await this.loadChannel(loc, seq);
            if (!jig) return;
            jig = await work(jig);
            jig = await this.finalizeTx(jig);
            return jig;
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
