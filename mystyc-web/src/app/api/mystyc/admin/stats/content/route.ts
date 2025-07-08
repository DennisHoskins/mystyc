import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { sessionManager } from '@/app/api/sessionManager';
import { authTokenManager } from '@/app/api/authTokenManager';
import { logger } from '@/util/logger';
import { ContentStats } from '@/interfaces';

export async function POST(request: NextRequest): Promise<Response> {
  logger.log(`[getContentStats] Get attempt started`);

  const body = await request.json();
  const { deviceInfo } = body;

  logger.log("[getContentStats] DeviceInfo destructured:", deviceInfo);

  const headersList = await headers();
  
  let session;
  try {
    session = await sessionManager.getCurrentSession(headersList, deviceInfo);
  } catch (err) {
    throw err;
  }

  if (!session) {
    logger.log('[getContentStats] No Current Session');
    return NextResponse.json(null, { status: 200 });
  }

  logger.log("[getStats] GET from Nest");

  // Call Nest to get fresh user data
  const nestResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/stats/content`, {
    method: 'GET',
    headers: {
      'Authorization': authTokenManager.createAuthHeader(session.authToken),
    },
  });

  if (!nestResponse.ok) {
    logger.error('[getContentStats] Failed to fetch user from Nest:', nestResponse.status);
    throw new Error(`[getContentStats] Failed to fetch user from Nest: ${nestResponse.status}`);
  }

  logger.log("[getContentStats] GET from Nest OK");

  const response: ContentStats = await nestResponse.json();

  
  return NextResponse.json(response, { status: 200 });
}