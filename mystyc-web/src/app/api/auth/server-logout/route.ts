import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { 
  getSessionCookieName, 
  decryptCookieValue,
} from '../../keyManager';

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

async function doServerLogout(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const source    = request.headers.get('x-source')  || 'unknown';
  logger.log('Server Logout initiated', { source, userAgent });

  let sessionData = null;

  // Manual extraction - get sessionId from cookie and scan for any auth tokens
  const cookieStore = await cookies();
  const encryptedSessionId = cookieStore.get(getSessionCookieName())?.value;
 
  if (!encryptedSessionId) {
    logger.error('[doServerLogout] No session cookie found');
    await doLogout();    
    return new Response('Unauthorized', { status: 401 });
  }

  const sessionId = decryptCookieValue(encryptedSessionId);
 
  if (!sessionId) {
    logger.error('[doServerLogout] Failed to decrypt session cookie');
    await doLogout();
    return new Response('Unauthorized', { status: 401 });
  }

  // Look for ANY auth token with this sessionId, regardless of device/uid
  const authKey = await sessionManager.getSessionAuthKey(sessionId)
  if (!authKey) {
    logger.error('[doServerLogout] Auth token value is null');
    await doLogout();
    return new Response('Unauthorized', { status: 401 });
  }

  // Extract uid and deviceId from the key for the logout call
  const keyParts = authKey.split('::');
  sessionData = {
    sessionId,
    deviceId: keyParts[2],
    uid: keyParts[3],
    authToken: keyParts[1]
  };

  logger.log('Found auth token via manual extraction for uid:', sessionData.uid);

  // Parse and validate request body
  const body: AuthLogoutBody = await request.json();
  const { deviceInfo, clientTimestamp } = body;

  // Build device object with deterministic ID based on request fingerprint
  const device = buildDevice(sessionData.uid, deviceInfo, request);
  logger.log(`[doServerLogout] Device ID generated:`, device.deviceId);

  logger.log('Clearing Session and Firebase Auth');
  await sessionManager.clearSession();
  await firebaseAuth.signOut();

  // Call Nest backend using the saved auth token
  logger.log(`[doServerLogout] Calling Nest API for Server Logout`);
  const nestResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/server-logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authTokenManager.createAuthHeader(authKey),
    },
    body: JSON.stringify({
      firebaseUid: sessionData.uid,
      device: device,
      clientTimestamp
    })
  });

  if (!nestResponse.ok) {
    const error = await nestResponse.text();
    logger.error(`[doServerLogout] Nest Logout failed:`, error);
  }

  await doLogout();
  logger.log('Server Logout completed successfully');
}

async function doLogout() {
  logger.log('Clearing Session and Firebase Auth');
  await sessionManager.clearSession();
  firebaseAuth.signOut();
}

export async function POST(request: NextRequest) {
  try {
    await doServerLogout(request);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('Server Logout error:', error);
    return NextResponse.json(
      { message: error.message ?? 'Server Logout failed', type: error.type ?? 'server_error' },
      { status: error.code ?? 500 }
    );
  }
}