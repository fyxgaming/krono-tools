import { IStorage } from './interfaces';
export class LRUCache implements IStorage<any> {
    protected cache = new Map<string, any>();
    public bytes = 0;

    constructor(private maxBytes: number, private maxEntries?: number) {}

    async set(key: string, value: any) {
        const serialized = JSON.stringify(value);
        this.bytes += serialized?.length || 0;
        this.cache.set(key, serialized);

        for (const delKey of Array.from(this.cache.keys())) {
            if ((!this.maxEntries || this.cache.size <= this.maxEntries) &&
                (!this.maxBytes || this.bytes <= this.maxBytes)
            ) break;
            const delValue = this.cache.get(delKey);
            this.bytes -= delValue?.length || 0;
            this.cache.delete(delKey);
        };

        return;
    }

    get(key: string) {
        if (this.cache.has(key)) {
            const value = this.cache.get(key);
            this.cache.delete(key);
            this.cache.set(key, value);
            return value && JSON.parse(value);
        }
    }

    async delete(key: string) {
        const delValue = this.cache.get(key);
        this.bytes -= delValue?.length || 0;
        this.cache.delete(key);
    }
}