import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { Content } from 'mystyc-common/schemas/';

import { logger } from '@/util/logger';

import { sessionManager, InvalidSessionError } from '../../../sessionManager';
import { authTokenManager } from '../../../authTokenManager';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    logger.log(`[mystyc] Get user content attempt started`, params);

    const body = await request.json();
    const { deviceInfo } = body;

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
      logger.log('[mystyc] No Current Session');
      return NextResponse.json(null, { status: 200 });
    }

    // Call Nest to get fresh user data
    const nestResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/content`, {
      method: 'POST',
      headers: {
        'Authorization': authTokenManager.createAuthHeader(session.authToken),
      },
      body: JSON.stringify({ deviceInfo })
    });

    if (!nestResponse.ok) {
      logger.error('[mystyc] Failed to fetch user content from Nest:', nestResponse.status);
      throw new InvalidSessionError(`[mystyc] Failed to fetch user content from Nest: ${nestResponse.status}`);
    }

    const content: Content = await nestResponse.json();
    
    return NextResponse.json(content, { status: 200 });
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