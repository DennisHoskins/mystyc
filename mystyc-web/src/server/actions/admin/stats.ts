'use server'

import { AdminStatsQuery } from 'mystyc-common/admin';
import { AdminStatsResponseExtended } from '@/interfaces/admin/stats';
import { DeviceInfo } from '@/interfaces/device-info.interface';
import { logger } from '@/util/logger';
import { withAdminAuth } from '@/server/util/admin/withAdminAuth';
import { nestGet } from '@/server/util/admin/nestClient';
import { sessionManager } from '@/server/services/sessionManager';
import { buildTrafficStats } from '@/server/services/trafficStats';

// Combined Dashboard Stats (Redis + Nest)
export async function getDashboardStats(params: {
  deviceInfo: DeviceInfo;
} & Partial<AdminStatsQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getDashboardStats] Fetching combined dashboard stats');
    const { deviceInfo, ...query } = fullParams;
    
    // Fetch from multiple sources in parallel
    const [nestResponse, sessionSummary, trafficStats] = await Promise.all([
      // Nest backend
      nestGet<any>(session, 'admin/stats', query),
      
      // Session data from Redis
      Promise.all([
        sessionManager.getTotalSessions(),
        sessionManager.getTotalDevices()
      ]).then(([totalSessions, totalDevices]) => ({
        summary: { totalSessions, totalDevices }
      })),
      
      // Traffic stats from Redis
      buildTrafficStats(query)
    ]);
    
    const response: AdminStatsResponseExtended = {
      ...nestResponse,
      sessions: sessionSummary,
      traffic: trafficStats
    };
    
    logger.log('[getDashboardStats] Combined stats generated successfully');
    return response;
  }, params);
}

// Traffic Stats (Redis-only)
export async function getTrafficStats(params: {
  deviceInfo: DeviceInfo;
} & Partial<AdminStatsQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getTrafficStats] Fetching traffic stats from Redis');
    const { deviceInfo, ...query } = fullParams;
    return buildTrafficStats(query);
  }, params);
}