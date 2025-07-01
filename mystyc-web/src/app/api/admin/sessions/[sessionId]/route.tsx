import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { sessionManager } from '../../../sessionManager';
import { logger } from '@/util/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  const body = await request.json();
  const { deviceInfo } = body;    

  // Get current session
  const headersList = await headers();
  const currentSession = await sessionManager.getCurrentSession(headersList, deviceInfo);
 
  if (!currentSession) {
    logger.error(`[admin/getSession] No session found`);
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (!currentSession.isAdmin) {
    logger.warn(`[admin/getSession] Non-admin user attempted access:`, currentSession.email);
    return NextResponse.json(
      { message: 'Forbidden - Admin access required' },
      { status: 403 }
    );
  }

  const session = await sessionManager.getSession(sessionId);
  return Response.json(session);
}