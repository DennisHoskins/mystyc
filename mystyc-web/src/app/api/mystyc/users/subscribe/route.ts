import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { sessionManager, InvalidSessionError } from '../../../sessionManager';
import { authTokenManager } from '../../../authTokenManager';
import { logger } from '@/util/logger';

export async function POST(
  request: NextRequest,
) {
  try {
    logger.log(`[mystyc] Subscribe attempt started`);

    const body = await request.json();
    const { deviceInfo, priceId } = body;

    logger.log("[mystyc] DeviceInfo destructured:", deviceInfo);

    const headersList = await headers();
    
    let session;
    try {
      session = await sessionManager.getCurrentSession(headersList, deviceInfo);
    } catch (err) {
      if (err instanceof InvalidSessionError) {
        throw err;
      }
      throw err;
    }

    if (!session) {
      logger.log('[mystyc] Subscribe: No Current Session');
      return NextResponse.json(null, { status: 200 });
    }

    // Call Nest to get fresh user data
    const nestResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/start-subscription`, {
      method: 'POST',
      headers: {
        'Authorization': authTokenManager.createAuthHeader(session.authToken),
        'Content-Type': 'application/json', 
      },
      body: JSON.stringify({ priceId })
    });

    if (!nestResponse.ok) {
      logger.error('[mystyc] Failed to post subscription from Nest:', nestResponse.status);
      throw new InvalidSessionError(`[mystyc] Failed to fetch subscription from Nest: ${nestResponse.status}`);
    }

    const sessionUrl: string = await nestResponse.json();
    
    return NextResponse.json(sessionUrl, { status: 200 });
  } catch (error: any) {
    logger.error(`[mystyc] Route handler error:`, error);
    
    if (error instanceof InvalidSessionError) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }
    
    return NextResponse.json(
      { message: error.message || 'Internal server error', type: error.type || 'server_error' },
      { status: error.code || 500 }
    );
  }
}