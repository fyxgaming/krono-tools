import { IStorage } from '../interfaces';
import { LRUCache } from '../lru-cache';

const createError = require('http-errors');
const fetch = require('node-fetch');

export class RestStateCache implements IStorage<any> {
    constructor(
        private apiUrl: string, 
        public cache: IStorage<any> = new LRUCache(10000000)
    ) { }

    async get(key: string): Promise<any> {
        let value = await this.cache.get(key);
        if (value) return value;
        try {
            const resp = await fetch(`${this.apiUrl}/${encodeURIComponent(key)}`);
            if(!resp.ok) {
                if(resp.status === 404) return;
                throw createError(resp.status, resp.statusText);
            }
            value = await resp.json();
            if (this.cache) {
                await this.cache.set(key, value);
            }
        } catch (e) {
            console.error('State Error', e.message, e.stack);
            return;
        }

        return value;
    }

    async set(key: string, value: any) {
        await this.cache.set(key, value);
    }

    async delete(key: string) {
        await this.cache.delete(key);
    }
}