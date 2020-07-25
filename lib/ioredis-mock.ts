export class IORedisMock {
    private store = new Map<string, any>();

    get(key: string): string {
        return this.store.get(key);
    }

    set(key: string, value: string) {
        return this.store.set(key, value);
    }

    del(key) {
        this.store.delete(key);
    }

    hget(key: string, field: string) {
        const item = this.store.get(key);
        if (!item) return;
        return item[field];
    }

    hset(key: string, field: string, value: string) {
        let item = this.store.get(key);
        if (!item) item = {};
        item[field] = value;
        this.store.set(key, item);
    }

    hmset(key: string, values: { [key: string]: string }) {
        const item = Object.assign(this.store.get(key) || {}, values);
        this.store.set(key, item);
    }

    hdel(key: string, field: string) {
        const item = this.store.get(key);
        delete item[field];
        this.store.set(key, item);
    }

    hgetall(key: string): { [key: string]: string } {
        return this.store.get(key) || {};
    }

    lindex(key: string, index: number) {
        const item = this.store.get(key);
        if (!item) return;
        return item[index];
    }

    lrange(key: string, start: number, end: number) {
        const item = this.store.get(key) || [];
        return item.slice(start, end + 1);
    }

    lset(key: string, index: number, value: string) {
        let item = this.store.get(key) || [];
        item[index] = value;
        this.store.set(key, item);
    }

    rpush(key: string, ...items: string[]) {
        let item = this.store.get(key) || [];
        item.push(...items);
        this.store.set(key, item);
    }

    exists(key: string) {
        return this.store.has(key);
    }

    expire(key) {
        return;
    }

    ttl(key) {
        return 1000000;
    }
}