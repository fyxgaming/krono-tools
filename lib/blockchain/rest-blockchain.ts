import { IUTXO, IAction, IStorage } from '../interfaces';
import { Blockchain } from '.';
import { LRUCache } from '../lru-cache';
import fetch from 'node-fetch';

const { Transaction } = require('bsv');
// const { API_KEY, RUNNETWORK, TXQ } = process.env;
const TXQ = 'https://kronoverse-testnet.txq-app.com';
const API_KEY = '6YuabhPHKvydGVkSaVpdM2AivRNZ86Fva1DnxLen41BFosb84vF4EzPM8xJeDb3kcW';

// const matter = mattercloudjs.instance({ api_key: API_KEY, network: RUNNETWORK });
export class RestBlockchain extends Blockchain {
    constructor(private apiUrl: string, network: string, public cache: IStorage<any> = new LRUCache(10000000)) {
        super(network);
    }

    async broadcast(tx) {
        console.time(`Broadcast: ${tx.hash}`);
        console.log(tx.toString())
        const resp = await fetch(`${this.apiUrl}/broadcast`, {
            method: 'POST',
            headers: { api_key: API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ rawtx: tx.toString() })
        });
        if (!resp.ok) throw new Error(await resp.text());
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

    async fetch(txid: string) {
        try {
            let rawtx = await this.cache.get(`tx:${txid}`);
            if (!rawtx) {
                const url = `${this.apiUrl}/tx/${txid}`;
                const resp = await fetch(`${this.apiUrl}/tx/${txid}`);
                if (resp.status === 404) return;
                rawtx = await resp.json();
                await this.cache.set(`tx:${txid}`, rawtx);
            }

            const tx = new Transaction(rawtx);
            const locs = tx.outputs.map((o, i) => `${txid}_o${i}`);
            const spends: any[] = await Promise.all(locs.map(async loc => {
                let spend = await this.cache.get(`spend:${loc}`);
                if (spend) return spend;
                const resp = await fetch(`${TXQ}/api/v1/txout/txid/${loc}`, { headers: { api_key: API_KEY } });
                if (!resp.ok) return {};
                spend = (await resp.json()).result;
                await this.cache.set(`spend:${loc}`, spend);
                return spend;
            }));

            tx.outputs.forEach((o: any, i) => {
                o.spentTxId = spends[i].spent_txid || null;
                o.spentIndex = spends[i].spent_index || null;
            });

            return tx;
        } catch (e) {
            console.log(`Fetch error: ${txid} - ${e.message}`);
            throw e;
        }
    };

    async utxos(address, start?: number): Promise<IUTXO[]> {
        if (typeof address !== 'string') {
            address = address.toAddress(this.bsvNetwork).toString();
        }
        const resp = await fetch(`${this.apiUrl}/utxos/${address}`);
        if (!resp.ok) throw new Error(await resp.text());
        return resp.json();
    };


    async isSpent(loc: string) {
        const resp = await fetch(`${this.apiUrl}/utxos/${loc}/spent`);
        if (!resp.ok) throw new Error(await resp.text());
        return await resp.json();
    }

    async utxosByLoc(locs: string[]): Promise<IUTXO[]> {
        const resp = await fetch(`${this.apiUrl}/utxos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ locs }),
        });
        if (!resp.ok) throw new Error(await resp.text());
        return resp.json();
    }

    async lockUtxo(address: string, expires: number, satoshis: number): Promise<IUTXO> {
        throw new Error('lockUtxo not implemented');
    };

    async getChannel(loc: string, seq?: number): Promise<any> {
        const resp = await fetch(`${this.apiUrl}/channel/${loc}`);
        if (!resp.ok) throw new Error(await resp.text());
        return await resp.json();
    }

    async submitAction(agentId: string, action: IAction) {
        console.log('submitting action:', agentId, JSON.stringify(action));
        const resp = await fetch(`${this.apiUrl}/${agentId}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(action),
        });
        if (!resp.ok) throw new Error(await resp.text());
        return resp.json();
    }

    async fund(address) {
        const resp = await fetch(`${this.apiUrl}/fund/${address}`);
        if (!resp.ok) throw new Error(await resp.text());
        return await resp.json();
    }
}
