import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { sessionManager, InvalidSessionError } from '@/app/api/sessionManager';
import { authTokenManager } from '../authTokenManager';
import { User } from '@/interfaces/user.interface';
import { logger } from '@/util/logger';

export async function POST(request: NextRequest): Promise<Response> {
  logger.log(`[getUser] Get attempt started`);

  const body = await request.json();
  const { deviceInfo } = body;

  logger.log("[getUser] DeviceInfo destructured:", deviceInfo);

  const headersList = await headers();
  
  let session;
  try {
    session = await sessionManager.getCurrentSession(headersList, deviceInfo);
  } catch (err) {
    throw err;
  }

  if (!session) {
    logger.log('[getUser] No Current Session');
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
    logger.error('[getUser] Failed to fetch user from Nest:', nestResponse.status);
    throw new InvalidSessionError(`[getUser] Failed to fetch user from Nest: ${nestResponse.status}`);

  }

  const user: User = await nestResponse.json();
  
  // Validate user object has required fields
  if (!user || !user.firebaseUser || !user.userProfile) {
    logger.error('[getUser] Invalid user object returned from Nest');
    throw new InvalidSessionError(`[getUser] Invalid user object returned from Nest`);
  }

  user.device = {
    firebaseUid: user.firebaseUser.uid,
    deviceId: session.deviceId,
    deviceName: session.deviceName,
    fcmToken: session.fcmToken
  }
  
  return NextResponse.json(user, { status: 200 });
}