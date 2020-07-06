import { IStorage } from '../interfaces';

export class MapStorage<T> implements IStorage<T> {
    protected cache = new Map<string, T>();

    async get(key: string): Promise<T> {
        return this.cache.get(key);
    }

    async set(key: string, value: T) {
        this.cache.set(key, value);
    }

    async update(key: string, update: T) {
        const value = {
            ...(this.cache.get(key) || {}),
            ...update
        }
        this.cache.set(key, value);
    }

    async delete(key: string) {
        this.cache.delete(key);
    }
}