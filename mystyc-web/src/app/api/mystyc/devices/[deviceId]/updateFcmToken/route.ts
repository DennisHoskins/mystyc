import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { sessionManager } from '../../../../sessionManager';
import { authTokenManager } from '../../../../authTokenManager';
import { Device } from '@/interfaces/device.interface';
import { logger } from '@/util/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  logger.log("[mystyc]", params);

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