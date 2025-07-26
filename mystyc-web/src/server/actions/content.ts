'use server'

import { Content } from 'mystyc-common/schemas/';
import { DeviceInfo } from '@/interfaces/device-info.interface';

import { logger } from '@/util/logger';

import redis from '@/server/lib/redis';

export async function getContent(deviceInfo: DeviceInfo): Promise<Content> {
  logger.log('[getContent] Get attempt started');

  // Parse client timezone
  const timezone = deviceInfo?.timezone || 'UTC';
  logger.log(`[getContent] Client timezone: ${timezone}`);

  // Compute local date (YYYY-MM-DD) in that timezone
  const localDate = new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date());
  const cacheKey = `content:${localDate}`;
  logger.log(`[getContent] Using cache key: ${cacheKey}`);

  // Attempt to read from Redis
  let cached: string | null = null;
  try {
    cached = await redis.get(cacheKey);
  } catch (err) {
    logger.error('[getContent] Redis GET failed', err);
  }

  if (cached) {
    logger.log('[getContent] Cache hit');
    try {
      const content: Content = JSON.parse(cached);
      return content;
    } catch (err) {
      logger.error('[getContent] JSON parse failed', err);
      // fall through to refetch
    }
  } else {
    logger.log('[getContent] Cache miss');
  }

  // Fetch fresh content from Nest service
  logger.log('[getContent] Fetching from Nest');
  const nestResponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/website-content/today`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceInfo })
    }
  );

  if (!nestResponse.ok) {
    logger.error('[getContent] Failed to fetch content:', nestResponse.status);
    throw new Error(`Failed to fetch content: ${nestResponse.status}`);
  }

  const content: Content = await nestResponse.json();

  // Cache the content in Redis
  try {
    await redis.set(cacheKey, JSON.stringify(content));
    logger.log('[getContent] Cached content under', cacheKey);
  } catch (err) {
    logger.error('[getContent] Redis SET failed', err);
  }

  return content;
}