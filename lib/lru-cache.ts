import { IStorage } from './interfaces';
export class LRUCache implements IStorage<any> {
    protected cache = new Map<string, any>();
    public bytes = 0;

    constructor(private maxBytes: number, private maxEntries?: number) {}

    async set(key: string, value: any) {
        let serialized;
        if(typeof value == 'number') {
            serialized = {bytes: 8, value}
        } else if (typeof value === 'string' || value instanceof Uint8Array) {
            serialized = { bytes: value.length, value }
        } else {
            const json = JSON.stringify(value)
            serialized = {json: true, bytes: json.length, value: json};
        }
        this.bytes += serialized.bytes;
        this.cache.set(key, serialized);

        for (const delKey of Array.from(this.cache.keys())) {
            if ((!this.maxEntries || this.cache.size <= this.maxEntries) &&
                (!this.maxBytes || this.bytes <= this.maxBytes)
            ) break;
            const delValue = this.cache.get(delKey);
            this.bytes -= delValue?.bytes || 0;
            this.cache.delete(delKey);
        };

        return;
    }

    get(key: string) {
        if (this.cache.has(key)) {
            const serialized = this.cache.get(key);
            this.cache.delete(key);
            this.cache.set(key, serialized);
            const value = serialized.json ? JSON.parse(serialized.value) : serialized.value;
            return value;
        }
    }

    async delete(key: string) {
        const delValue = this.cache.get(key);
        this.bytes -= delValue?.bytes || 0;
        this.cache.delete(key);
    }
}