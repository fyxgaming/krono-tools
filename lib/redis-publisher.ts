import IORedis from "ioredis";

import {Redis} from 'ioredis'
export class RedisPublisher {
    constructor(private redis: Redis, private cacheSize = 50) {}

    async publish(channel: string, event: string, data: {[key: string]: any}) {
        const ts = Date.now().toString();
        await this.redis.multi()
            .hset(channel, ts, JSON.stringify([event, data]))
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