import { createClient, RedisClientType } from 'redis';

const url = process.env.REDIS_URL;
if (!url) {
  throw new Error('REDIS_URL environment variable is not defined');
}

const redis: RedisClientType = createClient({ url });

redis.on('error', (err) => {
  console.error('Redis Client Error', err);
});

// Immediately initiate connection
(async () => {
  try {
    await redis.connect();
    console.log('Redis client connected');
  } catch (err) {
    console.error('Failed to connect Redis client', err);
  }
})();

export default redis;
