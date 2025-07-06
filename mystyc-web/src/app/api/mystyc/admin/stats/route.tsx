import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { sessionManager, InvalidSessionError } from '@/app/api/sessionManager';
import { authTokenManager } from '@/app/api/authTokenManager';
import { AdminStatsResponse } from '@/interfaces/admin/adminStatsResponse.interface';
import { logger } from '@/util/logger';

export async function POST(request: NextRequest): Promise<Response> {
  logger.log(`[getStats] Get attempt started`);

  const body = await request.json();
  const { deviceInfo } = body;

  logger.log("[getStats] DeviceInfo destructured:", deviceInfo);

  const headersList = await headers();
  
  let session;
  try {
    session = await sessionManager.getCurrentSession(headersList, deviceInfo);
  } catch (err) {
    throw err;
  }

  if (!session) {
    logger.log('[getStats] No Current Session');
    return NextResponse.json(null, { status: 200 });
  }

  logger.log("[getStats] GET from Nest");

  // Call Nest to get fresh user data
  const nestResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/stats`, {
    method: 'GET',
    headers: {
      'Authorization': authTokenManager.createAuthHeader(session.authToken),
    },
  });

  if (!nestResponse.ok) {
    logger.error('[getStats] Failed to fetch user from Nest:', nestResponse.status);
    throw new InvalidSessionError(`[getStats] Failed to fetch user from Nest: ${nestResponse.status}`);
  }

  logger.log("[getStats] GET from Nest OK");


  const response: AdminStatsResponse = await nestResponse.json();
  
  response.sessions = {
    summary: {
      totalSessions: await sessionManager.getTotalSessions(),
      totalDevices: await sessionManager.getTotalDevices()
    }
  }
  
  return NextResponse.json(response, { status: 200 });
}