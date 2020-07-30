import { IStorage } from './interfaces';
import { LRUCache } from './lru-cache';
import createError from 'http-errors';

const fetch = require('node-fetch');

const { Transaction } = require('bsv_legacy');

export class RestBlockchain {
    constructor(
        private apiUrl: string,
        public network: string,
        private cache: IStorage<any> = new LRUCache(10000000)
    ) {}
    
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

    async broadcast(tx) {
        console.time(`Broadcast: ${tx.hash}`);
        const resp = await fetch(`${this.apiUrl}/broadcast`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rawtx: tx.toString() })
        });
        if (!resp.ok) throw createError(resp.status, await resp.text());
        console.timeEnd(`Broadcast: ${tx.hash}`);
        await this.cache.set(`tx:${tx.hash}`, tx.toString());
        return tx.hash;
    }

    async fetch(txid: string, force?: boolean, retries = 0) {
        try {
            let rawtx = await this.cache.get(`tx://${txid}`);
            if (!rawtx) {
                const resp = await fetch(`${this.apiUrl}/tx/${txid}`);
                if (!resp.ok) throw createError(resp.status, await resp.text());
                rawtx = await resp.text();
                await this.cache.set(`tx://${txid}`, rawtx);
            }

            const tx = new Transaction(Buffer.from(rawtx, 'hex'));
            const locs = tx.outputs.map((o, i) => `${txid}_o${i}`);

            let spends = [];
            if (force) {
                const resp = await fetch(`${this.apiUrl}/spent`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ locs })
                });
                if (!resp.ok) throw createError(resp.status, await resp.text());
            }

            tx.outputs.forEach((o: any, i) => {
                o.spentTxId = spends[i] || null;
                o.spentIndex = null;
            });

            return tx;
        } catch (e) {
            console.log(`Fetch error: ${txid} - ${e.message}`);
            if(retries++ < 3) return this.fetch(txid, force, retries);
            throw e;
        }
    };

    async utxos(address) {
        if (typeof address !== 'string') {
            address = address.toAddress(this.bsvNetwork).toString();
        }
        const resp = await fetch(`${this.apiUrl}/utxos/${address}`);
        if (!resp.ok) throw new Error(await resp.text());
        return resp.json();
    };

    async isSpent(loc) {
        const resp = await fetch(`${this.apiUrl}/spent/${loc}`);
        if (!resp.ok) throw new Error(await resp.text());
        const spentTxId = await resp.text();
        return !!spentTxId;
    }

    async balance(address) {
        const resp = await fetch(`${this.apiUrl}/balance/${address}`);
        if (!resp.ok) throw createError(resp.status, await resp.text());
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

    async getChannel(loc: string, seq?: number): Promise<any> {
        const resp = await fetch(`${this.apiUrl}/channel/${loc}`);
        if (!resp.ok) throw createError(resp.status, await resp.text());
        return await resp.json();
    }

    async saveChannel(loc: string, rawtx: string) {
        const resp = await fetch(`${this.apiUrl}/channel/${loc}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rawtx })
        });
        if (!resp.ok) throw createError(resp.status, await resp.text());
    }

    async fund(address, satoshis?: number) {
        const resp = await fetch(`${this.apiUrl}/fund/${address}${satoshis ? `?satoshis=${satoshis}` : ''}`);
        if (!resp.ok) throw createError(resp.status, await resp.text());
        return await resp.json();
    }
}
