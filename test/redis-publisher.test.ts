import { RedisPublisher } from '../lib/redis-publisher';
const ioredis = require('@kronoverse/ioredis-mock');

const redis = new ioredis();
test('trims cache to cacheSize', async () => {
    await redis.del('channel');
    const cacheSize = 5;
    const pub = new RedisPublisher(redis, cacheSize);
    let ts;
    for(let i = 0; i < 7; i++) {
        ts = await pub.publish(['channel1', 'channel2'], i.toString(), {});
    }

    let keys = await redis.lrange('channel1', 0, -1);
    expect(keys.length).toBe(cacheSize);
    
    keys = await redis.lrange('channel2', 0, -1);
    expect(keys.length).toBe(cacheSize);
})