import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { logger } from '@/util/logger';

import { sessionManager } from '@/app/api/sessionManager';

export async function POST(request: NextRequest) {
  logger.log('');
  logger.log('[admin/sessions] GET request started');

  try {
    // Get current session
    const body = await request.json();
    const { deviceInfo } = body;    

    const headersList = await headers();
    const session = await sessionManager.getCurrentSession(headersList, deviceInfo);
    
    if (!session) {
      logger.error('[admin/sessions] No session found');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const sessions = await sessionManager.getSessions(limit, offset);

    logger.log('[admin/sessions] Sessions fetched successfully, count:', sessions.data.length || 0);
    
    return NextResponse.json(sessions);
  } catch (error) {
    logger.error('[admin/sessions] Error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}