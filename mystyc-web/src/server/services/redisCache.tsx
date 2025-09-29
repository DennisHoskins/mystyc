import 'server-only';

import redis from '@/server/util/redisClient';
import { logger } from '@/util/logger';

// Very long TTL since this data rarely changes (30 days)
const DEFAULT_TTL = 30 * 24 * 60 * 60; // 30 days in seconds

export const redisCacheService = {
  /**
   * Get data from cache or fetch and cache it
   */
  async getOrSet<T>(
    cacheKey: string,
    fetchFunction: () => Promise<T>,
    ttl: number = DEFAULT_TTL
  ): Promise<T> {
    try {
      // Try to get from Redis first
      logger.log('[redisCacheService] Checking cache for key:', cacheKey);
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        logger.log('[redisCacheService] Cache hit for key:', cacheKey);
        return JSON.parse(cached);
      }
      
      // Cache miss - fetch from source
      logger.log('[redisCacheService] Cache miss for key:', cacheKey, '- fetching from source');
      const data = await fetchFunction();
      
      if (data) {
        // Store in Redis with TTL
        await redis.setEx(cacheKey, ttl, JSON.stringify(data));
        logger.log('[redisCacheService] Cached data for key:', cacheKey, 'with TTL:', ttl);
      }
      
      return data;
    } catch (error) {
      logger.error('[redisCacheService] Cache operation failed for key:', cacheKey, error);
      // Fallback to direct fetch if Redis fails
      return fetchFunction();
    }
  },

  /**
   * Clear specific cache key
   */
  async clear(cacheKey: string): Promise<void> {
    try {
      await redis.del(cacheKey);
      logger.log('[redisCacheService] Cleared cache for key:', cacheKey);
    } catch (error) {
      logger.error('[redisCacheService] Failed to clear cache for key:', cacheKey, error);
    }
  },

  /**
   * Clear all cache keys matching a pattern
   */
  async clearPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(keys);
        logger.log('[redisCacheService] Cleared', keys.length, 'cache keys matching pattern:', pattern);
      } else {
        logger.log('[redisCacheService] No cache keys found matching pattern:', pattern);
      }
    } catch (error) {
      logger.error('[redisCacheService] Failed to clear cache pattern:', pattern, error);
    }
  }
};