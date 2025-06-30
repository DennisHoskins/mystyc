import { NextRequest } from 'next/server';
import { headers } from 'next/headers';

import { sessionManager } from '../../../sessionManager';
import { authTokenManager } from '../../../authTokenManager';
import { logger } from '@/util/logger';

export async function POST(request: NextRequest) {
 logger.log(``);
 logger.log(`[updateFcmToken] Update attempt started`);

 try {
    const body = await request.json();
    const { deviceInfo, fcmToken } = body;

    const headersList = await headers();
    const session = await sessionManager.getCurrentSession(headersList, deviceInfo);
    if (!session) {
      logger.error('[updateFcmToken] No Current Session');
      return new Response('Unauthorized', { status: 401 });
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

    return new Response(nestResponse.body, { 
      status: nestResponse.status,
      headers: nestResponse.headers 
    });
  } catch (error) {
    logger.error('[updateFcmToken] Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}