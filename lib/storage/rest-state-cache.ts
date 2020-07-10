import { IStorage } from '../interfaces';
import fetch from 'node-fetch';
import createError from 'http-errors';
import { LRUCache } from '../lru-cache';

export class RestStateCache implements IStorage<any> {
    constructor(
        private apiUrl: string, 
        public cache: IStorage<any> = new LRUCache(10000000),
        public postUpdates = false

    ) { }

    async get(key: string): Promise<any> {
        let value = await this.cache.get(key);
        if (value) return value;
        try {
            const resp = await fetch(`${this.apiUrl}/cache/${encodeURIComponent(key)}`);
            if(!resp.ok) {
                if(resp.status === 404) return;
                throw createError(resp.status, resp.statusText);
            }
            value = await resp.json();
            if (this.cache) {
                await this.cache.set(key, value);
            }
        } catch (e) {
            console.error('State Error', e.message);
            return;
        }

        return value;
    }

    async set(key: string, value: any) {
        await this.cache.set(key, value);
        if(!this.postUpdates) return;
        const resp = await fetch(`${this.apiUrl}/cache/${encodeURIComponent(key)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(value)
        });
        if (!resp.ok) throw createError(resp.status, resp.statusText);
    }

    async delete(key: string) {
        await this.cache.delete(key);
    }
}