import { Redis } from 'ioredis'
import microtime from 'microtime';
export class RedisPublisher {
    constructor(private redis: Redis, private cacheSize = 50, private expires = 3600) { }

    async publish(channels: string[], event: string, data: { [key: string]: any }): Promise<number> {
        const ts = microtime.now().toString();
        const id = ts.toString();
        const pipeline = this.redis.pipeline()
            .set(id, JSON.stringify([id, event, data]))
            .expire(id, this.expires);

        for (const channel of channels) {
            pipeline.rpush(channel, id)
                .ltrim(channel, 0 - this.cacheSize, -1)
                .publish(channel, JSON.stringify([id, event, data]))
        }
        await pipeline.exec();

        return ts;
    }
}