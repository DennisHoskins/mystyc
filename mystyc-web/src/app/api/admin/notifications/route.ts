import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { sessionManager } from '../../sessionManager';
import { authTokenManager } from '../../authTokenManager';
import { logger } from '@/util/logger';

export async function GET(request: NextRequest) {
  logger.log('');
  logger.log('[admin/notifications] GET request started');

  try {
    // Get current session
    const headersList = await headers();
    const session = await sessionManager.getCurrentSession(headersList);
    
    if (!session) {
      logger.error('[admin/notifications] No session found');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    
    logger.log('[admin/notifications] Query params:', queryString);

    // Call Nest admin endpoint
    const nestResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/notifications${queryString ? `?${queryString}` : ''}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authTokenManager.createAuthHeader(session.authToken),
        }
      }
    );

    if (!nestResponse.ok) {
      const error = await nestResponse.text();
      logger.error('[admin/notifications] Nest request failed:', error);
      
      return NextResponse.json(
        { message: 'Failed to fetch Notifications' },
        { status: nestResponse.status }
      );
    }

    const data = await nestResponse.json();
    logger.log('[admin/notifications] Notifications fetched successfully, count:', data.data?.length || 0);
    
    return NextResponse.json(data);

  } catch (error) {
    logger.error('[admin/notifications] Error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}