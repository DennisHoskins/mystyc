import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { generateDeviceId } from '../../keyManager';
import { sessionManager } from '../../sessionManager';
import { extractDeviceFingerprint } from '../deviceManager';
import { getSessionCookieName } from '../../keyManager';
import { logger } from '@/util/logger';

export async function POST(request: NextRequest) {
  try {
    logger.log('[server-logout] Called - clearing session cookie');
    
    const body = await request.json();
    const { deviceInfo } = body;
    
    // Calculate deviceId to send to Nest
    const fingerprint = extractDeviceFingerprint(request);
    const deviceId = generateDeviceId(fingerprint, deviceInfo);

    // Clear the session cookie
    const cookieStore = await cookies();
    cookieStore.delete(getSessionCookieName());

    // get firebase uid from device
    const firebaseUid = await sessionManager.getDeviceUid(deviceId);
    if (!firebaseUid) {
      logger.error('[server-logout] Unable to get Device Uid:', deviceId);
      return;
    }

    console.log("SECRET: ", process.env.INTERNAL_API_SECRET);
    
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