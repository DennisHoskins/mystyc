import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { sessionManager, InvalidSessionError } from '@/app/api/sessionManager';
import { authTokenManager } from '@/app/api/authTokenManager';
import { buildTrafficStats } from './trafficStats.service';
import { AdminStatsResponseExtended } from '@/interfaces/admin/stats/adminStatsResponseWithSessions.interface';
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

    // Extract all query parameters
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const queryString = url.searchParams.toString();

    // Fetch data
    const [nestResponse, sessionSummary, trafficStats] = await Promise.all([
      // Nest backend - pass through all query parameters
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/stats${queryString ? `?${queryString}` : ''}`, {
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

      // Traffic stats with same query parameters
      buildTrafficStats(queryParams)
    ]);

    const response: AdminStatsResponseExtended = {
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