import { IStorage } from '../interfaces';
import { Redis } from 'ioredis';

export class RedisStorage<T> implements IStorage<T> {
    constructor(private redis: Redis) { }

    async get(key: string) {
        const state = await this.redis.get(key);
        return state && JSON.parse(state);
    }

    async set(key: string, state: T) {
        await this.redis.set(key, JSON.stringify(state));
    }

    async delete(key: string) {
        await this.redis.delete(key);
    }
}
