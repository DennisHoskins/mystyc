import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { sessionManager } from '@/app/api/sessionManager';
import { logger } from '@/util/logger';

export async function POST(request: NextRequest): Promise<Response> {
  logger.log(`[getSessionStats] Get attempt started`);

  const body = await request.json();
  const { deviceInfo } = body;

  logger.log("[getSessionStats] DeviceInfo destructured:", deviceInfo);

  const headersList = await headers();
  
  let session;
  try {
    session = await sessionManager.getCurrentSession(headersList, deviceInfo);
  } catch (err) {
    throw err;
  }

  if (!session) {
    logger.log('[getSessionStats] No Current Session');
    return NextResponse.json(null, { status: 200 });
  }

  const response = {
    summary: {
      totalSessions: await sessionManager.getTotalSessions(),
      totalDevices: await sessionManager.getTotalDevices()
    }
  }
  
  return NextResponse.json(response, { status: 200 });
}