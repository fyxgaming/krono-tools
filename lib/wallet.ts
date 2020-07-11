import * as secp from 'noble-secp256k1';
import { Blockchain } from './blockchain';
import { IAction, IJig, IStorage } from './interfaces';
import { EventEmitter } from 'events';
import fetch from 'isomorphic-fetch'

// import { Notifier } from './notifier';

const { crypto, PrivateKey, Transaction } = require('bsv');

export class Wallet extends EventEmitter {
    fetch = fetch;
    private agent: any;
    private blockchain: Blockchain;
    pubkey: string;
    address: string;
    purse: string;
    transaction: any;
    private privkey: string;

    private jigs = new Map<string, IJig>();
    private handlers = new Map<any, (jig: IJig, channel?: any) => Promise<void>>();
    private channelHandlers = new Map<any, (jig: IJig, channel?: any) => Promise<void>>();
    private queue: Promise<any> = Promise.resolve();

    constructor(
        private run: any,
        private apiUrl: string,
        private storage?: IStorage<any>
    ) {
        super();

        this.blockchain = run.blockchain;
        this.transaction = run.transaction;
        this.privkey = new PrivateKey(run.owner.privkey).toBuffer().toString('hex');
        this.pubkey = run.owner.pubkey;
        this.address = run.owner.address;

        this.purse = run.purse.address;

        console.log(`OWNER: ${this.address}`);
        console.log(`PUBKEY: ${this.pubkey}`);
        console.log(`PURSE: ${this.purse}`);

        (console as any).emit = (event, payload) => {
            console.log(event, payload);
            this.emit('jig-event', event, payload);
        };
    }

    async initializeAgent(location: string) {
        console.log('AGENT:', location);
        const Agent = await this.run.load(location);
        this.agent = new Agent(this, this.blockchain, this.handlers, this.channelHandlers);
        await this.agent.initialize();
    }

    private addToQueue(process: () => Promise<any>) {
        const queuePromise = this.queue.then(process)
        this.queue = queuePromise.catch(e => console.error('Queue error', e.message, e.stack));
        return queuePromise;
    }

    async handleEvent(handlerName: string, payload?: any): Promise<any> {
        if (handlerName.startsWith('_') || typeof this.agent[handlerName] !== 'function') return;
        return this.addToQueue(async () => this.agent[handlerName](payload));
    }

    scheduleHandler(delaySeconds: number, handlerName: string, payload?: any) {
        this.emit('schedule', delaySeconds, handlerName, payload);
    }

    async loadJig(loc: string): Promise<IJig> {
        console.time(`load ${loc}`);
        const jig = this.jigs.get(loc) || await this.run.load(loc)
            .catch((e) => {
                if (e.message.includes('not a run tx') ||
                    e.message.includes('not a jig output') ||
                    e.message.includes('Not a token')
                ) {
                    console.log('Not a jig:', loc);
                    return;
                }
                console.error('Load error:', e.message);
                throw e;
            });
        console.timeEnd(`load ${loc}`);
        return jig;
    }

    async loadJigs() {
        console.log('Load Jigs');
        const utxos = await this.blockchain.utxos(this.address);
        const jigs = [];
        for (const utxo of utxos) {
            const loc = `${utxo.txid}_o${utxo.vout}`;
            const jig = await this.loadJig(loc);
            if (jig) jigs.push(jig);
        }
        this.jigs.clear();
        jigs.forEach(jig => this.jigs.set(jig.location, jig));
        console.log('JIGS:', jigs.length);
        return jigs;
    }

    async loadJigIndex() {
        console.time('jigIndex');
        const resp = await fetch(`${this.apiUrl}/jigs/${this.address}`);
        const jigData = resp.ok ? await resp.json() : [];
        return jigData;
    }

    async loadChannel(loc: string, seq?: number) {
        const now = Date.now();
        console.time(`load channel ${loc} ${now}`);
        const txData = await this.blockchain.getChannel(loc);
        if (!txData || (seq && txData.seq !== seq)) return;
        const tx = new Transaction(txData);
        console.timeEnd(`load channel ${loc} ${now}`);
        console.time(`import ${loc} ${now}`);
        await this.transaction.import(tx);
        console.timeEnd(`import ${loc} ${now}`);
        return this.transaction.actions
            .map(action => action.target)
            .find(jig => jig.KRONO_CHANNEL && jig.KRONO_CHANNEL.loc === loc);
    }

    async onUtxo(loc: string) {
        return this.addToQueue(async () => {
            console.log('OnUTXO:', loc);
            const jig = await this.loadJig(loc);
            if (!jig) return;
            console.log('JIG', jig.constructor.name, loc);
            await jig.sync();
            if (jig.location !== loc) {
                console.log('Jig spent:', loc);
                return;
            }
            const handler = this.handlers.get((jig.constructor as any).origin);
            if (!handler) {
                console.log('No handler:', jig.constructor.name, loc);
                return;
            };
            console.log('handler:', handler.name);
            await handler.bind(this.agent)(jig);
        });
    }

    async onChannel(loc: string) {
        return this.addToQueue(async () => {
            console.log('onChannel', loc);
            try {
                const jig = await this.loadChannel(loc);
                if (!jig) return;
                console.log('CHANNEL', jig.constructor.name, loc);
                const handler = this.channelHandlers.get((jig.constructor as any).origin);
                if (!handler) return;
                console.log('handler:', handler.name);
                await handler.bind(this.agent)(jig);
            } finally {
                this.transaction.rollback();
            }
        });
    }

    async submitAction(agentId: string, name: string, loc: string, hash: string, payload?: any) {
        const sig = await secp.sign(hash, this.privkey);
        const action: IAction = { name, loc, hash, payload, sig };
        const url = `${this.apiUrl}/${agentId}/submit`;
        console.log('Submitting action:', name, url);
        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(action)
        });
        if (!resp.ok) throw new Error(await resp.text());
        return resp.json();
    }

    async finalizeTx(jig?: IJig) {
        if (jig) {
            console.log('Committing:', jig.constructor.name, jig.KRONO_CHANNEL?.loc, jig.KRONO_CHANNEL?.seq);
            if (jig.KRONO_CHANNEL) {
                const { loc, seq } = jig.KRONO_CHANNEL;
                const now = new Date();
                this.run.purse.nLocktime = now.setMonth(now.getMonth() + 12) / 1000;
                this.run.purse.seqs[loc] = seq;
            }
        }
        if ((this.transaction.actions || []).length) {
            this.transaction.end();
        } else {
            this.transaction.rollback();
        }
        this.run.purse.nLocktime = 0;
        this.run.purse.seqs = {};
        await (jig ? jig.sync({ forward: false }) : this.run.sync());
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
        if (max > Number.MAX_SAFE_INTEGER) throw new Error('Max must be <= ' + Number.MAX_SAFE_INTEGER);
        return Math.floor(Math.random() * max);
    }

    randomBytes(size: number) {
        return crypto.Random.getRandomBuffer(size).toString('hex');
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

    verifySig(sig, hash, pubkey): boolean {
        console.time('verify');
        const verified = secp.verify(sig, hash, pubkey);
        console.timeEnd('verify');
        return verified;
    }
}
