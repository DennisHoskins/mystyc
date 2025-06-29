import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { sessionManager } from '../../../sessionManager';
import { logger } from '@/util/logger';

export async function GET(request: NextRequest) {
  logger.log('');
  logger.log('[admin/sessions/devices] GET request started');

  try {
    // Get current session
    const body = await request.json();
    const { deviceInfo } = body;    

    const headersList = await headers();
    const session = await sessionManager.getCurrentSession(headersList, deviceInfo);
    
    if (!session) {
      logger.error('[admin/sessions/devices] No session found');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const sessionsDevices = await sessionManager.getSessionsDevices(limit, offset);

    logger.log('[admin/sessions/devices] Sessions Devices fetched successfully, count:', sessionsDevices.data.length || 0);
    
    return NextResponse.json(sessionsDevices);
  } catch (error) {
    logger.error('[admin/sessions/devices] Error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}