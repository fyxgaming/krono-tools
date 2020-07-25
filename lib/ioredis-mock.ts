export class IORedisMock {
    private store = new Map<string, any>();
    private expires = new Map<string, number>();

    private _expire(key) {
        const expires = this.expires.get(key);
        if(expires && expires < Date.now()) {
            this.store.delete(key);
            this.expires.delete(key);
        }
    }

    get(key: string): string {
        this._expire(key);
        return this.store.get(key);
    }

    set(key: string, value: string) {
        this.expires.delete(key);
        this.store.set(key, value);
    }

    del(key) {
        this.expires.delete(key);
        this.store.delete(key);
    }

    hget(key: string, field: string) {
        this._expire(key);
        const item = this.store.get(key);
        if (!item) return;
        return item[field];
    }

    hset(key: string, field: string, value: string) {
        this._expire(key);
        this.expires.delete(key);
        let item = this.store.get(key);
        if (!item) item = {};
        item[field] = value;
        this.store.set(key, item);
    }

    hmset(key: string, values: { [key: string]: string }) {
        this._expire(key);
        this.expires.delete(key);
        const item = Object.assign(this.store.get(key) || {}, values);
        this.store.set(key, item);
    }

    hdel(key: string, field: string) {
        this._expire(key);
        this.expires.delete(key);
        const item = this.store.get(key);
        delete item[field];
        this.store.set(key, item);
    }

    hgetall(key: string): { [key: string]: string } {
        this._expire(key);
        return this.store.get(key) || {};
    }

    lindex(key: string, index: number) {
        this._expire(key);
        const item = this.store.get(key);
        if (!item) return;
        return item[index];
    }

    lrange(key: string, start: number, end: number) {
        this._expire(key);
        const item = this.store.get(key) || [];
        return item.slice(start, end + 1);
    }

    lset(key: string, index: number, value: string) {
        this._expire(key);
        this.expires.delete(key);
        let item = this.store.get(key) || [];
        item[index] = value;
        this.store.set(key, item);
    }

    rpush(key: string, ...items: string[]) {
        this._expire(key);
        this.expires.delete(key);
        let item = this.store.get(key) || [];
        item.push(...items);
        this.store.set(key, item);
    }

    exists(key: string) {
        this._expire(key);
        return this.store.has(key);
    }

    expire(key, seconds) {
        this.expires.set(key, seconds * 1000 + Date.now())
    }

    ttl(key): number {
        this._expire(key);
        if(!this.store.has(key)) return -2; 
        const expires = this.expires.get(key);
        if(!expires) return -1;
        return Math.floor((expires - Date.now()) / 1000);
    }
}