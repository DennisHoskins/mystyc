import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { 
  getSessionCookieName, 
  decryptCookieValue,
} from '../../keyManager';

import { buildDevice, extractDeviceFingerprint } from '@/app/api/auth/deviceManager';
import { generateDeviceId } from '../../keyManager';
import { sessionManager } from '@/app/api/sessionManager';
import { authTokenManager } from '@/app/api/authTokenManager';
import { firebaseAuth } from '@/app/api/firebaseAuth';
import { logger } from '@/util/logger';

export interface ServerLogoutBody {
  deviceInfo: {
    cores: string,
    renderer: string,
    timezone: string,
    language: string
  };
  clientTimestamp: string;
}



async function doServerLogout(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const source = request.headers.get('x-source') || 'unknown';
  logger.log('Server Logout initiated', { source, userAgent });

  let authTokenForLogout = null;
  let sessionData = null;

  // Try to get session from cookie first
  const cookieStore = await cookies();
  const encryptedSessionId = cookieStore.get(getSessionCookieName())?.value;
  
  if (encryptedSessionId) {
    const sessionId = decryptCookieValue(encryptedSessionId);
    if (sessionId) {
      authTokenForLogout = await sessionManager.getSessionAuthKey(sessionId);
      if (authTokenForLogout) {
        const keyParts = authTokenForLogout[0].split('::');
        sessionData = {
          sessionId,
          deviceId: keyParts[2],
          uid: keyParts[3],
          authToken: authTokenForLogout
        };
      }
    }
  }

  const body: ServerLogoutBody = await request.json();
  const { deviceInfo, clientTimestamp } = body;

  // If cookie method failed, try device fingerprint method
  if (!sessionData) {
    logger.log('[doServerLogout] Cookie method failed, trying device fingerprint method');

    // Calculate deviceId from request fingerprint
    const fingerprint = extractDeviceFingerprint(request);
    const deviceId = generateDeviceId(fingerprint, deviceInfo);
    
    // Look up sessionId for this device
    const actualSessionId = await sessionManager.getDeviceSession(deviceId);
    if (actualSessionId) {
      authTokenForLogout = await sessionManager.getSessionAuthKey(actualSessionId);
      if (authTokenForLogout) {
        const keyParts = authTokenForLogout[0].split('::');
        sessionData = {
          sessionId: actualSessionId,
          deviceId: keyParts[2],
          uid: keyParts[3],
          authToken: authTokenForLogout
        };
        logger.log('[doServerLogout] Found session via device mapping');
      }
    }
  }

  if (!sessionData) {
    logger.error('[doServerLogout] No session data available via any method');
    await doLogout();
    return new Response('Unauthorized', { status: 401 });
  }

  const device = buildDevice(sessionData.uid, deviceInfo, request);
  logger.log(`[doServerLogout] Device ID generated:`, device.deviceId);

  logger.log('Clearing Session and Firebase Auth');
  await sessionManager.clearSession();
  await firebaseAuth.signOut();

  // Call Nest backend using the saved auth token
  if (authTokenForLogout) {
    logger.log(`[doServerLogout] Calling Nest API for Server Logout`);
    const nestResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/server-logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authTokenManager.createAuthHeader(authTokenForLogout),
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