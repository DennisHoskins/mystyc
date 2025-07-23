import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { User } from 'mystyc-common/schemas/';

import { UserRequest } from '@/interfaces/user-requests.interface';
import { logger } from '@/util/logger';
import { sessionManager, InvalidSessionError } from '../../sessionManager';
import { authTokenManager } from '../../authTokenManager';

export async function POST(
  request: NextRequest,
) {
  try {
    logger.log(`[mystyc] Get user attempt started`);

    const body: UserRequest = await request.json();
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
    const nestResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': authTokenManager.createAuthHeader(session.authToken),
      },
    });

    if (!nestResponse.ok) {
      logger.error('[mystyc] Failed to fetch user from Nest:', nestResponse.status);
      throw new InvalidSessionError(`[mystyc] Failed to fetch user from Nest: ${nestResponse.status}`);
    }

    const user: User = await nestResponse.json();
    
    // Validate user object has required fields
    if (!user || !user.firebaseUser || !user.userProfile) {
      logger.error('[mystyc] Invalid user object returned from Nest');
      throw new InvalidSessionError(`[mystyc] Invalid user object returned from Nest`);
    }

    user.device = {
      firebaseUid: user.firebaseUser.uid,
      deviceId: session.deviceId,
      deviceName: session.deviceName,
    }
    
    return NextResponse.json(user, { status: 200 });
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