import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { sessionManager } from '../../sessionManager';
import { buildTrafficStats } from '../../services/trafficStats.service';
import { logger } from '@/util/logger';

export async function handleRedisRoute(
  request: NextRequest, 
  route: string, 
  path: string[]
): Promise<NextResponse> {
  try {
    logger.log(`[redisHandler] Handling route: ${route}`);
    
    const body = await request.json();
    const { deviceInfo } = body;

    // Validate admin session
    const headersList = await headers();
    const session = await sessionManager.getCurrentSession(headersList, deviceInfo);
    
    if (!session) {
      logger.error(`[redisHandler] No session found for route: ${route}`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.isAdmin) {
      logger.warn(`[redisHandler] Non-admin user attempted access to ${route}:`, session.email);
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    logger.log(`[redisHandler] Admin access granted to ${route}:`, session.email);

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    switch (route) {
      case 'sessions': {
        const data = await sessionManager.getSessions(limit, offset);
        logger.log(`[redisHandler] Sessions fetched, count:`, data.data?.length || 0);
        return NextResponse.json(data);
      }
      
      case 'sessions/devices': {
        const data = await sessionManager.getSessionsDevices(limit, offset);
        logger.log(`[redisHandler] Session devices fetched, count:`, data.data?.length || 0);
        return NextResponse.json(data);
      }
      
      case 'stats/sessions': {
        const data = {
          summary: {
            totalSessions: await sessionManager.getTotalSessions(),
            totalDevices: await sessionManager.getTotalDevices()
          }
        };
        logger.log(`[redisHandler] Session stats fetched:`, data.summary);
        return NextResponse.json(data);
      }
      
      case 'stats/traffic': {
        const query = Object.fromEntries(searchParams.entries());
        logger.log(`[redisHandler] Building traffic stats with query:`, query);
        const data = await buildTrafficStats(query);
        logger.log(`[redisHandler] Traffic stats generated, total visits:`, data.visitors?.totalVisits || 0);
        return NextResponse.json(data);
      }

      // Handle session by ID
      default: {
        if (route.startsWith('sessions/') && path.length === 2) {
          const sessionId = path[1];
          logger.log(`[redisHandler] Getting session by ID:`, sessionId.substring(0, 8));
          const sessionData = await sessionManager.getSession(sessionId);
          
          if (!sessionData) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
          }
          
          return NextResponse.json(sessionData);
        }
        
        logger.error(`[redisHandler] Unknown Redis route: ${route}`);
        return NextResponse.json({ error: 'Route not found' }, { status: 404 });
      }
    }
  } catch (error) {
    logger.error(`[redisHandler] Error handling route ${route}:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}