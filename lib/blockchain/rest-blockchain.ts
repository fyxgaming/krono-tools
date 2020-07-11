import { IUTXO, IAction, IStorage } from '../interfaces';
import { Blockchain } from '.';
import { LRUCache } from '../lru-cache';
import createError from 'http-errors';

import fetch from 'isomorphic-fetch'

const { Transaction } = require('bsv');

export class RestBlockchain extends Blockchain {
    constructor(
        private apiUrl: string,
        network: string,
        public cache: IStorage<any> = new LRUCache(10000000),
        // private txq: string,
        // private apiKey: string,
        private cacheSpends = false
    ) {
        super(network);
    }

    async broadcast(tx) {
        console.time(`Broadcast: ${tx.hash}`);
        const resp = await fetch(`${this.apiUrl}/broadcast`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rawtx: tx.toString() })
        });
        if (!resp.ok) throw createError(resp.status, resp.statusText);
        console.timeEnd(`Broadcast: ${tx.hash}`);
        await this.cache.set(`tx:${tx.hash}`, tx.toString());
        return tx.hash;
    }

    async saveTx(tx): Promise<IUTXO[]> {
        const txid = tx.hash;
        return tx.outputs.map((o, vout) => o.script.isPublicKeyHashOut() && {
            _id: `${txid}_o${vout}`,
            address: o.script.toAddress(this.bsvNetwork).toString(),
            script: o.script.toString(),
            satoshis: o.satoshis,
            txid,
            ts: Date.now(),
            vout,
            lockUntil: 0
        }).filter(utxo => utxo);
    }

    async fetch(txid: string, force?: boolean) {
        try {
            let rawtx = await this.cache.get(`tx://${txid}`);
            if (!rawtx) {
                const resp = await fetch(`${this.apiUrl}/tx/${txid}`);
                if (!resp.ok) throw createError(resp.status, resp.statusText);
                rawtx = await resp.json();
                await this.cache.set(`tx://${txid}`, rawtx);
            }

            const tx = new Transaction(Buffer.from(rawtx, 'hex'));
            const locs = tx.outputs.map((o, i) => `${txid}_o${i}`);

            let spends = this.cacheSpends && await this.cache.get(`spends:${txid}`);
            if (!spends) {
                const resp = await fetch(`${this.apiUrl}/spent`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ locs })
                });
                if (!resp.ok) throw createError(resp.status, resp.statusText);
                spends = await resp.json();
                if (this.cacheSpends) await this.cache.set(`spends:${txid}`, spends);
            }

            tx.outputs.forEach((o: any, i) => {
                o.spentTxId = spends[i] || null;
                o.spentIndex = null;
            });

            return tx;
        } catch (e) {
            console.log(`Fetch error: ${txid} - ${e.message}`);
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

    async balance(address) {
        const resp = await fetch(`${this.apiUrl}/balance/${address}`);
        if (!resp.ok) throw createError(resp.status, resp.statusText);
        return resp.json();
    }

    async kindHistory(kind: string, query: any) {
        const resp = await fetch(`${this.apiUrl}/jigs/kind/${kind}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(query)
        });
        if (!resp.ok) throw createError(resp.status, resp.statusText);
        return resp.json();
    }

    async originHistory(origin: string, query: any) {
        const resp = await fetch(`${this.apiUrl}/jigs/origin/${origin}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(query)
        });
        if (!resp.ok) throw createError(resp.status, resp.statusText);
        return resp.json();
    }

    async saveChannel(loc: string, rawTx: string) {
        const resp = await fetch(`${this.apiUrl}/channel/${loc}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rawTx })
        });
        if (!resp.ok) throw createError(resp.status, resp.statusText);
    }

    async getChannel(loc: string, seq?: number): Promise<any> {
        const resp = await fetch(`${this.apiUrl}/channel/${loc}`);
        if (!resp.ok) throw createError(resp.status, resp.statusText);
        return await resp.json();
    }

    async submitAction(agentId: string, action: IAction) {
        console.log('submitting action:', agentId, JSON.stringify(action));
        const resp = await fetch(`${this.apiUrl}/${agentId}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(action),
        });
        if (!resp.ok) throw createError(resp.status, resp.statusText);
        return resp.json();
    }

    async fund(address, satoshis?: number) {
        const resp = await fetch(`${this.apiUrl}/fund/${address}`);
        if (!resp.ok) throw createError(resp.status, resp.statusText);
        return await resp.json();
    }
}
