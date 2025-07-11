import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { sessionManager, InvalidSessionError } from '../../sessionManager';
import { authTokenManager } from '../../authTokenManager';
import { User } from '@/interfaces/user.interface';
import { Device } from '@/interfaces/device.interface';
import { logger } from '@/util/logger';

// Handle user routes
async function handleUserRoute(request: NextRequest): Promise<NextResponse> {
  logger.log(`[mystyc] Get user attempt started`);

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
}

// Handle FCM token update
async function handleUpdateFcmToken(request: NextRequest, deviceId: string): Promise<NextResponse> {
  logger.log(`[mystyc] UpdateFcmToken attempt started for device:`, deviceId.substring(0, 8));

  try {
    const body = await request.json();
    const { deviceInfo, fcmToken } = body;

    const headersList = await headers();
    const session = await sessionManager.getCurrentSession(headersList, deviceInfo);
    if (!session) {
      logger.error('[mystyc] No Current Session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const nestResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/devices/notify-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authTokenManager.createAuthHeader(session.authToken),
      },
      body: JSON.stringify({
        firebaseUid: session.uid,
        deviceId: session.deviceId,
        fcmToken
      })
    });

    await sessionManager.updateSessionFcmToken(session.sessionId, session.deviceId, session.uid, fcmToken);
    logger.log("[mystyc] Updated fcmToken in Redis", session.sessionId.substring(0, 8), fcmToken);

    const device: Device = await nestResponse.json();
    
    return NextResponse.json(device, { status: nestResponse.status });
  } catch (error) {
    logger.error('[mystyc] UpdateFcmToken Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Main route handler
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const route = path.join('/');

    logger.log(`[mystyc] Handling route: ${route}`);

    if (route === 'users') {
      return handleUserRoute(request);
    }

    if (route.match(/^devices\/[^\/]+\/updateFcmToken$/)) {
      const deviceId = path[1];
      return handleUpdateFcmToken(request, deviceId);
    }

    logger.error(`[mystyc] Unknown route: ${route}`);
    return NextResponse.json({ error: 'Route not found' }, { status: 404 });

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