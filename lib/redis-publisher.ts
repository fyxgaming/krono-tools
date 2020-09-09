import {Redis} from 'ioredis'
import microtime from 'microtime';
export class RedisPublisher {
    constructor(private redis: Redis, private cacheSize = 50) {}

    async publish(channel: string, event: string, data: {[key: string]: any}) {
        // TODO: Add entropy to id;
        const ts = microtime.now().toString();
        await this.redis.multi()
            .hset(channel, ts, JSON.stringify([ts, event, data]))
            .publish(channel, JSON.stringify([ts, event, data]))
            .exec();

        const keys = await this.redis.hkeys(channel);
        keys.sort((a, b) => b > a ? 1 : -1);
        const pipeline = this.redis.pipeline();
        for(let key of keys.slice(this.cacheSize)) {
            pipeline.hdel(key);
        }
        await pipeline.exec();
    }
}