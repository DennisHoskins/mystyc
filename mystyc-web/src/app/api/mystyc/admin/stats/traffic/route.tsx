import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { sessionManager } from '@/app/api/sessionManager';
import { buildTrafficStats } from '../trafficStats.service';
import { TrafficStats } from '@/interfaces';
import { AdminTrafficStatsQuery } from '@/interfaces/admin/adminTrafficStatsQuery.interface';
import { logger } from '@/util/logger';

export async function POST(request: NextRequest): Promise<Response> {
  logger.log('[getTrafficStats] Request started');

  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const query: AdminTrafficStatsQuery = {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      maxRecords: searchParams.get('maxRecords') ? parseInt(searchParams.get('maxRecords')!) : undefined
    };

    // Parse request body
    const body = await request.json();
    const { deviceInfo, clientTimestamp } = body;    

    logger.log('[getTrafficStats] Query parameters:', query);

    // Validate session
    const headersList = await headers();
    let session;
    try {
      session = await sessionManager.getCurrentSession(headersList, deviceInfo);
    } catch (err) {
      logger.error('[getTrafficStats] Session validation failed', err);
      return NextResponse.json(
        { error: 'Session validation failed' }, 
        { status: 401 }
      );
    }

    if (!session) {
      logger.log('[getTrafficStats] No valid session found');
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    // Build and return traffic stats
    const stats = await buildTrafficStats(query);
    
    logger.log('[getTrafficStats] Stats generated successfully', {
      totalVisits: stats.visitors.totalVisits,
      dateRange: stats.visitors.dailyVisits.length
    });

    return NextResponse.json(stats);

  } catch (error) {
    logger.error('[getTrafficStats] Request failed', error);
    
    // Return empty stats on error rather than failing completely
    const emptyStats: TrafficStats = {
      visitors: { totalVisits: 0, dailyVisits: [] },
      pages: [],
      devices: [],
      userTypes: { visitor: 0, authenticated: 0 },
      hourlyVisits: [],
      timezoneHourlyVisits: [],
      dayOfWeekVisits: [],
      browsers: [],
      oses: [],
      deviceTypes: [],
      timezones: [],
      languages: [],
      browserDevices: [],
      browserDevicesDetailed: [],
      platformDevices: [],
      fullCombinations: []
    };

    return NextResponse.json(emptyStats);
  }
}