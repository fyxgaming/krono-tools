import { IStorage } from '../interfaces';
import { LRUCache } from '../lru-cache';

const createError = require('http-errors');
const fetch = require('node-fetch');

export class RestStateCache implements IStorage<any> {
    constructor(
        private apiUrl: string, 
        public cache: IStorage<any> = new LRUCache(10000000)
    ) { 
        console.log('Cache URL:', apiUrl);
    }

    async get(key: string): Promise<any> {
        let value = await this.cache.get(key);
        if (value) return value;
        const url = `${this.apiUrl}/${encodeURIComponent(key)}`;
        try {
            const resp = await fetch(url);
            console.log('Status:', resp.status, resp.ok);
            if(!resp.ok) {
                if(resp.status === 404) return;
                throw createError(resp.status, resp.statusText);
            }
            value = await resp.json();
            if (this.cache) {
                await this.cache.set(key, value);
            }
        } catch (e) {
            console.error('State Error', url, e.message, e.stack);
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