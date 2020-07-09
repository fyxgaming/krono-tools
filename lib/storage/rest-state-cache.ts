import { IStorage } from '../interfaces';
import fetch from 'node-fetch';
import createError from 'http-errors';

export class RestStateCache implements IStorage<any> {
    constructor(private apiUrl: string, public cache?: Map<string, any>) { }

    async get(key: string): Promise<any> {
        if (this.cache && this.cache.has(key)) {
            return this.cache.get(key);
        }

        let value: any;
        try {
            const resp = await fetch(`${this.apiUrl}/state/${key}`);
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
        if (this.cache) this.cache.set(key, value);
    }

    async delete(key: string) {
        this.cache.delete(key);
    }
}