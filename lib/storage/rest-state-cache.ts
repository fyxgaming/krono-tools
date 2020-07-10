import { IStorage } from '../interfaces';
import fetch from 'node-fetch';
import createError from 'http-errors';
import { LRUCache } from '../lru-cache';

export class RestStateCache implements IStorage<any> {
    constructor(private apiUrl: string, public cache: IStorage<any> = new LRUCache(10000000)) { }

    async get(key: string): Promise<any> {
        let value = await this.cache.get(key);
        if (value) return value;
        try {
            const resp = await fetch(`${this.apiUrl}/cache/${key}`);
            if(!resp.ok) {
                if(resp.status === 404) return;
                throw createError(resp.status, resp.statusText);
            }
            value = await resp.json();
            if (this.cache) {
                this.cache.set(key, value);
            }
        } catch (e) {
            console.error('State Error', e.message);
            return;
        }

        return value;
    }

    async set(key: string, value: any) {
        this.cache.set(key, value);
    }

    async delete(key: string) {
        this.cache.delete(key);
    }
}