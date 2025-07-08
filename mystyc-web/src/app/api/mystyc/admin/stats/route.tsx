import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { sessionManager, InvalidSessionError } from '@/app/api/sessionManager';
import { authTokenManager } from '@/app/api/authTokenManager';
import { buildTrafficStats } from './trafficStats.service';
import { AdminStatsResponse } from '@/interfaces/admin/adminStatsResponse.interface';
import { logger } from '@/util/logger';

export async function POST(request: NextRequest): Promise<Response> {
  logger.log('[getStats] Admin stats request started');

  try {
    // Get URL and body
    const url = new URL(request.url);
    const body = await request.json();
    const { deviceInfo } = body;

    // Validate session
    const headersList = await headers();
    let session;
    try {
      session = await sessionManager.getCurrentSession(headersList, deviceInfo);
    } catch (err) {
      if (err instanceof InvalidSessionError) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
      }
      throw err;
    }

    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Parse traffic query parameters from URL  
    const trafficQuery: any = {};
    
    if (url.searchParams.has('traffic.startDate')) {
      trafficQuery.startDate = url.searchParams.get('traffic.startDate');
    }
    if (url.searchParams.has('traffic.endDate')) {
      trafficQuery.endDate = url.searchParams.get('traffic.endDate');
    }
    if (url.searchParams.has('traffic.maxRecords')) {
      trafficQuery.maxRecords = parseInt(url.searchParams.get('traffic.maxRecords') || '50');
    }
    if (url.searchParams.has('traffic.period')) {
      trafficQuery.period = url.searchParams.get('traffic.period');
    }
    if (url.searchParams.has('traffic.limit')) {
      trafficQuery.limit = parseInt(url.searchParams.get('traffic.limit') || '30');
    }

    // Fetch data
    const [nestResponse, sessionSummary, trafficStats] = await Promise.all([
      // Nest backend
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/stats`, {
        method: 'GET',
        headers: {
          'Authorization': authTokenManager.createAuthHeader(session.authToken),
        },
      }).then(async (res) => {
        if (!res.ok) {
          throw new Error(`Nest API failed: ${res.status}`);
        }
        return res.json();
      }),

      // Session data
      Promise.all([
        sessionManager.getTotalSessions(),
        sessionManager.getTotalDevices()
      ]).then(([totalSessions, totalDevices]) => ({
        summary: { totalSessions, totalDevices }
      })),

      // Traffic stats with parsed query
      buildTrafficStats(trafficQuery)
    ]);

    const response: AdminStatsResponse = {
      ...nestResponse,
      sessions: sessionSummary,
      traffic: trafficStats
    };

    return NextResponse.json(response);

  } catch (error) {
    logger.error('[getStats] Failed:', error);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}