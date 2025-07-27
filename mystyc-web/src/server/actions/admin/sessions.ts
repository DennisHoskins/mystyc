'use server'

import { AdminStatsQuery, BaseAdminQuery } from 'mystyc-common/admin';
import { DeviceInfo } from '@/interfaces/device-info.interface';
import { logger } from '@/util/logger';
import { withAdminAuth } from '@/server/util/admin/withAdminAuth';
import { sessionManager } from '@/server/services/sessionManager';

// Session Stats (Redis-only)
export async function getSessionStats(params: {
  deviceInfo: DeviceInfo;
} & Partial<AdminStatsQuery>) {
  return withAdminAuth(async (session) => {
    logger.log('[getSessionStats] Fetching session statistics from Redis', session.sessionId);
    return {
      summary: {
        totalSessions: await sessionManager.getTotalSessions(),
        totalDevices: await sessionManager.getTotalDevices()
      }
    };
  }, params);
}

// Session List (Redis-only)
export async function getSessions(params: {
  deviceInfo: DeviceInfo;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getSessions] Fetching sessions from Redis', session.sessionId, fullParams);
    const limit = params.limit ?? 20;
    const offset = params.offset ?? 0;
    return sessionManager.getSessions(limit, offset);
  }, params);
}

// Session Devices (Redis-only)
export async function getSessionsDevices(params: {
  deviceInfo: DeviceInfo;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getSessionsDevices] Fetching session devices from Redis', session.sessionId, fullParams);
    const limit = params.limit ?? 20;
    const offset = params.offset ?? 0;
    return sessionManager.getSessionsDevices(limit, offset);
  }, params);
}

// Single Session (Redis-only)
export async function getSession(params: {
  deviceInfo: DeviceInfo;
  sessionId: string;
}) {
  return withAdminAuth(async (session, { sessionId }) => {
    logger.log('[getSession] Fetching session from Redis:', sessionId.substring(0, 8));
    return sessionManager.getSession(sessionId);
  }, params);
}