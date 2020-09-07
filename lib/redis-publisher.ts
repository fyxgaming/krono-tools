import { Redis } from 'ioredis'
import microtime from 'microtime';
export class RedisPublisher {
    constructor(private redis: Redis, private cacheSize = 50, private expires = 3600) { }

    async publish(channels: string[], event: string, data: { [key: string]: any }): Promise<number> {
        const ts = microtime.now().toString();
        const pipeline = this.redis.pipeline()
            .set(ts, JSON.stringify([ts, event, data]))
            .expire(ts, this.expires);

        for (const channel of channels) {
            pipeline.rpush(channel, ts)
                .ltrim(channel, 0 - this.cacheSize, -1)
                .publish(channel, JSON.stringify([ts, event, data]))
        }
        await pipeline.exec();

        return ts;
    }
}