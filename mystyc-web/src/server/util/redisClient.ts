import { createClient, RedisClientType } from 'redis';

import { logger } from '@/util/logger';

const url = process.env.REDIS_URL;
if (!url) {
  throw new Error('REDIS_URL environment variable is not defined');
}

const redis: RedisClientType = createClient({ url });

redis.on('error', (err) => {
  logger.error('Redis Client Error', err);
});

// Immediately initiate connection
(async () => {
  try {
    await redis.connect();
    logger.log('Redis client connected');
  } catch (err) {
    logger.error('Failed to connect Redis client', err);
  }
})();

export default redis;
