import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { sessionManager, InvalidSessionError } from '@/app/api/sessionManager';
import { authTokenManager } from '../authTokenManager';
import { User } from '@/interfaces/user.interface';
import { logger } from '@/util/logger';

export async function POST(request: NextRequest): Promise<Response> {

  logger.log(`[getUser] Get attempt started`);

  let sessionExists = false;

  try {
    const body = await request.json();
    const { deviceInfo } = body;

    logger.log("[getUser] DeviceInfo destructured:", deviceInfo);

    const headersList = await headers();
    const session = await sessionManager.getCurrentSession(headersList, deviceInfo);
    if (!session) {
      logger.error('[getUser] No Current Session');
      return NextResponse.json(null, { status: 200 });
    }

    sessionExists = true;

    // Validate the token is still good
    const result = await authTokenManager.validateAndDecode(session);
    if (!result) {
      throw new Error('Invalid auth token');
    }

    const { decoded, session: currentSession } = result;    
    if (!decoded || !currentSession) {
      logger.log('[getUser] Fresh session not found');
      return NextResponse.json(null, { status: 200 });
    }

    // Call Nest to get fresh user data
    const nestResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': authTokenManager.createAuthHeader(currentSession.authToken),
      },
    });

    if (!nestResponse.ok) {
      logger.error('[getUser] Failed to fetch user from Nest:', nestResponse.status);
      return NextResponse.json({ user: null, authenticated: true }, { status: 200 });
    }

    const user: User = await nestResponse.json();
    
    // Validate user object has required fields
    if (!user || !user.firebaseUser || !user.userProfile) {
      logger.error('[getUser] Invalid user object returned from Nest');
      return NextResponse.json({ user: null, authenticated: true }, { status: 200 });
    }
    
    return NextResponse.json({ user, authenticated: true }, { status: 200 });
  } catch (err: any) {
    // Handle specific InvalidSessionError
    if (err instanceof InvalidSessionError) {
      logger.log('[getUser] Session exists but corrupted:', err.message);
      return NextResponse.json({ user: null, authenticated: true }, { status: 200 });
    }
    
    // If we found a session but got an error, it's corrupted
    if (sessionExists) {
      logger.log('[getUser] Session exists but corrupted:', err.message);
      return NextResponse.json({ user: null, authenticated: true }, { status: 200 });
    }
    
    // If no session was found and we got an error, treat as no session
    logger.log('[getUser] No session found (with error):', err.message);
    return NextResponse.json(null, { status: 200 });
  }
}