import { NextRequest, NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';

import { AuthLogoutRequest, AuthResetPasswordRequest } from '@/interfaces/auth-requests.interface';
import { logger } from '@/util/logger';
// import { extractDeviceFingerprint, buildDevice } from '@/server/services/deviceManager';
import { buildDevice } from '@/server/services/deviceManager';
// import { generateDeviceId, getSessionCookieName } from '@/server/services/keyManager';
import { getSessionCookieName } from '@/server/services/keyManager';
import { sessionManager } from '@/server/services/sessionManager';
import { authTokenManager } from '@/server/services/authTokenManager';
import { firebaseAuth } from '@/server/services/firebaseAuth';
import { handleAuth } from './authHandler';

// Logout handler
async function handleLogout(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const source = request.headers.get('x-source') || 'unknown';
  logger.log('Logout initiated', { source, userAgent });

  const body: AuthLogoutRequest = await request.json();
  const { deviceInfo, clientTimestamp } = body;

  const headersList = await headers();
  const session = await sessionManager.getCurrentSession(headersList, deviceInfo);
  if (!session) {
    logger.error('[handleLogout] No Current Session');
    return new Response('Unauthorized', { status: 401 });
  }

  const device = buildDevice(session.uid, deviceInfo, request);
  logger.log(`[handleLogout] Device ID generated:`, device.deviceId);

  logger.log('Clearing Session and Firebase Auth');
  await sessionManager.clearSession();

  // sign out of firebase
  await firebaseAuth.signOut();

  if (!session.authToken) {
    logger.error('[handleLogout] No Auth Token');
    return new Response('Unauthorized', { status: 401 });
  }

  logger.log(`[handleLogout] Calling Nest API for Logout`);
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
    logger.error(`[handleLogout] Nest Logout failed:`, error);
  }

  logger.log('Logout completed successfully');
  return NextResponse.json({ success: true });
}

// Server logout handler
async function handleServerLogout(request: NextRequest) {
  try {
    logger.log('[server-logout] Called - clearing session cookie');
    
    const body: AuthLogoutRequest = await request.json();
    const { deviceInfo } = body;
    
    // Calculate deviceId to send to Nest

    // const fingerprint = extractDeviceFingerprint(request);
    // const deviceId = generateDeviceId(fingerprint, deviceInfo);
    const deviceId = deviceInfo.deviceId;

    // Clear the session cookie
    const cookieStore = await cookies();
    cookieStore.delete(getSessionCookieName());

    // sign out of firebase 
    await firebaseAuth.signOut();

    // get firebase uid from device
    const firebaseUid = await sessionManager.getDeviceUid(deviceId);
    if (!firebaseUid) {
      logger.error('[server-logout] Unable to get Device Uid:', deviceId);
      return NextResponse.json({ success: true });
    }
    
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/server-logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': process.env.INTERNAL_API_SECRET!
        },
        body: JSON.stringify({
          firebaseUid,
          deviceId,
          timestamp: new Date().toISOString()
        })
      });
    } catch (nestError) {
      logger.error('[server-logout] Failed to notify Nest:', nestError);
    }
    
    logger.log('[server-logout] Completed successfully');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('[server-logout] Error:', error);
    return NextResponse.json({ message: 'Server logout failed' }, { status: 500 });
  }
}

// Password reset handler
async function handlePasswordReset(request: NextRequest) {
  try {
    const body: AuthResetPasswordRequest = await request.json();
    const { email } = body;

    await firebaseAuth.resetPassword(email);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    logger.error('Password reset error:', error);

    const errorMap: Record<string, { code: number; message: string }> = {
      'auth/invalid-email': { code: 400, message: 'Invalid email format' },
      'auth/too-many-requests': { code: 429, message: 'Too many requests' }
    };
    
    const mapped = errorMap[error.code];
    if (mapped) {
      return NextResponse.json(
        { message: mapped.message, type: 'auth_error' },
        { status: mapped.code }
      );
    }

    return NextResponse.json(
      { message: error.message || 'Password reset failed', type: error.type || 'server_error' },
      { status: error.code || 500 }
    );
  }
}

// Main route handler
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    const { action } = await params;

    switch (action) {
      case 'login':
        return handleAuth(request, false);
      case 'register':
        return handleAuth(request, true);
      case 'logout':
        return handleLogout(request);
      case 'server-logout':
        return handleServerLogout(request);
      case 'reset-password':
        return handlePasswordReset(request);
      default:
        return NextResponse.json({ error: 'Invalid auth action' }, { status: 404 });
    }
  } catch (error: any) {
    logger.error(`Auth action failed:`, error);
    return NextResponse.json(
      { message: error.message || 'Authentication failed', type: error.type || 'server_error' },
      { status: error.code || 500 }
    );
  }
}