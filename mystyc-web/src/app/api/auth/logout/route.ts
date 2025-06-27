import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { buildDevice } from '@/app/api/auth/deviceManager';
import { sessionManager } from '@/app/api/sessionManager';
import { authTokenManager } from '@/app/api/authTokenManager';
import { firebaseAuth } from '@/app/api/firebaseAuth';
import { logger } from '@/util/logger';

export interface AuthLogoutBody {
  deviceInfo: {
    timezone: string,
    language: string
  };
  clientTimestamp: string;
}


async function doLogout(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const source    = request.headers.get('x-source')  || 'unknown';
  logger.log('Logout initiated', { source, userAgent });

  const headersList = await headers();
  const session = await sessionManager.getCurrentSession(headersList);
  if (!session) {
    logger.error('[doLogout] No Current Session');
    return new Response('Unauthorized', { status: 401 });
  }

  // Parse and validate request body
  const body: AuthLogoutBody = await request.json();
  const { deviceInfo, clientTimestamp } = body;

  // Build device object with deterministic ID based on request fingerprint
  const device = buildDevice(session.uid, deviceInfo, request);
  logger.log(`[authHandler] Device ID generated:`, device.deviceId);

  logger.log('Clearing Session and Firebase Auth');
  await sessionManager.clearSession();
  await firebaseAuth.signOut();

  // Call Nest backend to register session and get user profile
  logger.log(`[authHandler] Calling Nest API for Logout`);
  const nestResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authTokenManager.createAuthHeader(session.authToken),
    },
    body: JSON.stringify({
      firebaseUid: session.uid,
      device: device,
      clientTimestamp
    })
  });

  if (!nestResponse.ok) {
    const error = await nestResponse.text();
    logger.error(`[authHandler] Nest Logout failed:`, error);
  }

  logger.log('Logout completed successfully');
}

export async function POST(request: NextRequest) {
  try {
    await doLogout(request);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('Logout error:', error);
    return NextResponse.json(
      { message: error.message ?? 'Logout failed', type: error.type ?? 'server_error' },
      { status: error.code ?? 500 }
    );
  }
}