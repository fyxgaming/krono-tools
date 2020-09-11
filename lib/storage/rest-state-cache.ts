import { IStorage } from '../interfaces';
import { LRUCache } from '../lru-cache';

const createError = require('http-errors');
const fetch = require('node-fetch');

export class RestStateCache implements IStorage<any> {
    private requests = new Map<string, Promise<any>>();
    constructor(
        private apiUrl: string,
        public cache: IStorage<any> = new LRUCache(10000000)
    ) { }

    async get(key: string): Promise<any> {
        let value = await this.cache.get(key);
        if (value) return value;

        if (!this.requests.has(key)) {
            const request = (async () => {
                const resp = await fetch(`${this.apiUrl}/state/${encodeURIComponent(key)}`);
                if (!resp.ok) {
                    if (resp.status === 404) {
                        return;
                    }
                    throw createError(resp.status, resp.statusText);
                }
                value = await resp.json();
                await this.cache.set(key, value);
                this.requests.delete(key);
                return value;

            })();
            this.requests.set(key, request);
        }
        return this.requests.get(key);
    }

    async set(key: string, value: any) {
        await this.cache.set(key, value);
    }

    async delete(key: string) {
        await this.cache.delete(key);
    }
}