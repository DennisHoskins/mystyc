import { NextRequest, NextResponse } from 'next/server';

import { logger } from '@/util/logger';
import { DailyContent } from '@/interfaces/dailyContent.interface';

export async function POST(request: NextRequest): Promise<Response> {
  logger.log(`[getDailyContent] Get attempt started`);

  const body = await request.json();
  const { deviceInfo } = body;

  logger.log("[getDailyContent] DeviceInfo destructured:", deviceInfo);

  // Call Nest to get fresh user data
  const nestResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/daily-content/today`, {
    method: 'GET',
  });

  if (!nestResponse.ok) {
    logger.error('[getUser] Failed to fetch user from Nest:', nestResponse.status);
    throw new Error(`[getDailyContent] Failed to fetch content from Nest: ${nestResponse.status}`);
  }

  const content: DailyContent = await nestResponse.json();


  // save in db with device analytics
  
  return NextResponse.json(content, { status: 200 });
}