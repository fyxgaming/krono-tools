import { IStorage, IUTXO } from './interfaces';
import { LRUCache } from './lru-cache';
import { SignedMessage } from './signed-message';

const createError = require('http-errors');
const fetch = require('node-fetch');

export class RestBlockchain {
    private requests = new Map<string, Promise<any>>();
    constructor(
        private apiUrl: string,
        public network: string,
        private cache: IStorage<any> = new LRUCache(10000000),
        private debug = false
    ) { }

    get bsvNetwork(): string {
        switch (this.network) {
            case 'stn':
                return 'stn';
            case 'main':
                return 'mainnet';
            default:
                return 'testnet';
        }
    }

    async broadcast(rawtx) {
        const resp = await fetch(`${this.apiUrl}/broadcast`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rawtx })
        });
        if (!resp.ok) throw createError(resp.status, await resp.text());
        const hash = await resp.json();
        this.debug && console.log('Broadcast:', hash);
        await this.cache.set(`tx://${hash}`, rawtx);
    }

    async populateInputs(tx) {
        await Promise.all(tx.inputs.map(async input => {
            const outTx = await this.fetch(input.prevTxId.toString('hex'));
            input.output = outTx.outputs[input.outputIndex];
        }));
    }

    async fetch(txid: string) {
        let rawtx = await this.cache.get(`tx://${txid}`);
        if (rawtx) return rawtx;
        if (!this.requests.has(txid)) {
            const request = Promise.resolve().then(async () => {
                const resp = await fetch(`${this.apiUrl}/tx/${txid}`);
                if (!resp.ok)
                    throw createError(resp.status, await resp.text());
                rawtx = await resp.text();
                await this.cache.set(`tx://${txid}`, rawtx);
                this.requests.delete(txid);
                return rawtx;
            });
            this.requests.set(txid, request);
        }
        return this.requests.get(txid);
    };

    async time(txid: string): Promise<number> {
        return Date.now();
        // const resp = await fetch(`${this.apiUrl}/tx/${txid}`);
        // if (resp.ok) {
        //     const {time} = await resp.json();
        //     await this.cache.set(`tx://${txid}`, rawtx);
        //     break;
        // }
    }

    async spends(txid: string, vout: number): Promise<string | null> {
        let spend = await this.cache.get(`spend://${txid}`);
        if (spend) return spend;
        if (!this.requests.has(`spend:${txid}`)) {
            const request = (async () => {
                const resp = await fetch(`${this.apiUrl}/spent/${txid}_o${vout}`);
                if (!resp.ok) throw createError(resp.status, await resp.text());
                spend = (await resp.text()) || null;
                if(spend) await this.cache.set(`spend://${txid}`, spend);
                this.requests.delete(`spend:${txid}`);
                return spend;
            })();
            this.requests.set(`spend:${txid}`, request);
        }
        return this.requests.get(`spend:${txid}`);
    }

    async utxos(address): Promise<IUTXO[]> {
        if (typeof address !== 'string') {
            address = address.toAddress(this.bsvNetwork).toString();
        }
        const resp = await fetch(`${this.apiUrl}/utxos/${address}`);
        if (!resp.ok) throw new Error(await resp.text());
        return resp.json();
    };

    // async isSpent(loc) {
    //     const resp = await fetch(`${this.apiUrl}/spent/${loc}`);
    //     if (!resp.ok) throw new Error(await resp.text());
    //     const spentTxId = await resp.text();
    //     return !!spentTxId;
    // }

    async jigIndex(address) {
        const resp = await fetch(`${this.apiUrl}/jigs/${address}`);
        if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`);
        return resp.json();
    }

    async kindHistory(kind: string, query: any) {
        const resp = await fetch(`${this.apiUrl}/jigs/kind/${kind}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(query)
        });
        if (!resp.ok) throw createError(resp.status, await resp.text());
        return resp.json();
    }

    async originHistory(origin: string, query: any) {
        const resp = await fetch(`${this.apiUrl}/jigs/origin/${origin}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(query)
        });
        if (!resp.ok) throw createError(resp.status, await resp.text());
        return resp.json();
    }

    async fund(address: string, satoshis?: number) {
        const resp = await fetch(`${this.apiUrl}/fund/${address}${satoshis ? `?satoshis=${satoshis}` : ''}`);
        if (!resp.ok) throw createError(resp.status, await resp.text());
        return resp.text();
    }

    async loadMessage(messageId): Promise<SignedMessage> {
        const resp = await fetch(`${this.apiUrl}/messages/${messageId}`);
        if (!resp.ok) throw createError(resp.status, await resp.text());
        return new SignedMessage(await resp.json());
    }

    async sendMessage(message: SignedMessage, postTo?: string): Promise<void> {
        const resp = await fetch(postTo || `${this.apiUrl}/messages`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(message)
        });
        if (!resp.ok) throw createError(resp.status, await resp.text());
    }
}
