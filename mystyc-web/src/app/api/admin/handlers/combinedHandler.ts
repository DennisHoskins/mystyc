import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { sessionManager, InvalidSessionError } from '../../sessionManager';
import { authTokenManager } from '../../authTokenManager';
import { buildTrafficStats } from '../../services/trafficStats.service';
import { AdminStatsResponseExtended } from '@/interfaces/admin/stats/admin-stats-response-extended.interface';
import { logger } from '@/util/logger';

export async function handleCombinedRoute(
  request: NextRequest,
  route: string,
  path: string[]
): Promise<NextResponse> {
  logger.log(`[combinedHandler] Handling route: ${route}`, path);

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

    if (!session.isAdmin) {
      logger.warn(`[combinedHandler] Non-admin user attempted access to ${route}:`, session.email);
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    logger.log(`[combinedHandler] Admin access granted to ${route}:`, session.email);

    // Extract all query parameters
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const queryString = url.searchParams.toString();

    if (route === 'stats') {
      logger.log(`[combinedHandler] Building combined stats with query:`, queryParams);
      
      // Fetch data from multiple sources in parallel
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

        // Session data from Redis
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

      logger.log(`[combinedHandler] Combined stats generated successfully`);
      return NextResponse.json(response);
    }

    logger.error(`[combinedHandler] Unknown combined route: ${route}`);
    return NextResponse.json({ error: 'Route not found' }, { status: 404 });

  } catch (error) {
    logger.error(`[combinedHandler] Failed to handle route ${route}:`, error);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}