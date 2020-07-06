export class LRUCache extends Map<string, any> {
    public bytes = 0;

    constructor(private maxBytes: number, private maxEntries?: number) {
        super();
    }

    set(key: string, value: any): this {
        const serialized = JSON.stringify(value);
        this.bytes += serialized?.length || 0;
        super.set(key, serialized);

        for (const delKey of Array.from(this.keys())) {
            if ((!this.maxEntries || this.size <= this.maxEntries) &&
                (!this.maxBytes || this.bytes <= this.maxBytes)
            ) break;
            const delValue = super.get(delKey);
            this.bytes -= delValue?.length || 0;
            this.delete(delKey);
        };

        return this;
    }

    get(key: string) {
        if (this.has(key)) {
            const value = super.get(key);
            this.delete(key);
            super.set(key, value);
            return value && JSON.parse(value);
        }
    }
}