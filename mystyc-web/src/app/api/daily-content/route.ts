import redis from '../redisClient';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/util/logger';
import { DailyContent } from '@/interfaces/dailyContent.interface';

export async function POST(request: NextRequest) {
  logger.log('[getDailyContent] Get attempt started');

  // Parse client timezone from request body
  const { deviceInfo } = await request.json();
  const timezone = deviceInfo?.timezone || 'UTC';
  logger.log(`[getDailyContent] Client timezone: ${timezone}`);

  // Compute local date (YYYY-MM-DD) in that timezone
  const localDate = new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date());
  const cacheKey = `daily-content:${localDate}`;
  logger.log(`[getDailyContent] Using cache key: ${cacheKey}`);

  // Attempt to read from Redis
  let cached: string | null = null;
  try {
    cached = await redis.get(cacheKey);
  } catch (err) {
    logger.error('[getDailyContent] Redis GET failed', err);
  }

  if (cached) {
    logger.log('[getDailyContent] Cache hit');
    try {
      const content: DailyContent = JSON.parse(cached);
      return NextResponse.json(content);
    } catch (err) {
      logger.error('[getDailyContent] JSON parse failed', err);
      // fall through to refetch
    }
  } else {
    logger.log('[getDailyContent] Cache miss');
  }

  // Fetch fresh content from Nest service
  logger.log('[getDailyContent] Fetching from Nest');
  const nestResponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/daily-content/today`
  );

  if (!nestResponse.ok) {
    logger.error('[getDailyContent] Failed to fetch daily content:', nestResponse.status);
    return NextResponse.error();
  }

  const content: DailyContent = await nestResponse.json();

  // Cache the content in Redis
  try {
    await redis.set(cacheKey, JSON.stringify(content));
    logger.log('[getDailyContent] Cached content under', cacheKey);
  } catch (err) {
    logger.error('[getDailyContent] Redis SET failed', err);
  }

  // Return the fresh content
  return NextResponse.json(content);
}