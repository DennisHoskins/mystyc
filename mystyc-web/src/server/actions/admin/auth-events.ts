'use server'

import { AdminStatsQuery, AdminListResponse, BaseAdminQuery } from 'mystyc-common/admin';
import { AuthEvent } from 'mystyc-common/schemas/';
import { AuthEventStats, AuthEventsSummary } from 'mystyc-common/admin/interfaces';
import { DeviceInfo } from '@/interfaces/device-info.interface';
import { logger } from '@/util/logger';
import { withAdminAuth } from '@/server/util/admin/withAdminAuth';
import { nestGet } from '@/server/util/admin/nestClient';

// Auth Event Stats
export async function getAuthEventStats(params: {
  deviceInfo: DeviceInfo;
} & Partial<AdminStatsQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getAuthEventStats] Fetching auth event statistics');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<AuthEventStats>(session, 'admin/stats/auth-events', query);
  }, params);
}

// Auth Events Summary
export async function getAuthEventsSummary(params: { deviceInfo: DeviceInfo }) {
  return withAdminAuth(async (session) => {
    logger.log('[getAuthEventsSummary] Fetching auth events summary');
    return nestGet<AuthEventsSummary>(session, 'admin/auth-events/summary');
  }, params);
}

// Combined Stats + Summary
export async function getAuthEventsSummaryStats(params: {
  deviceInfo: DeviceInfo;
} & Partial<AdminStatsQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getAuthEventsSummaryStats] Fetching combined stats and summary');
    const { deviceInfo, ...query } = fullParams;
    
    const [stats, summary] = await Promise.all([
      nestGet<AuthEventStats>(session, 'admin/stats/auth-events', query),
      nestGet<AuthEventsSummary>(session, 'admin/auth-events/summary')
    ]);
    
    return { stats, summary };
  }, params);
}

// List Operations
export async function getAuthEvents(params: {
  deviceInfo: DeviceInfo;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getAuthEvents] Fetching auth events');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<AdminListResponse<AuthEvent>>(session, 'admin/auth-events', query);
  }, params);
}

export async function getAuthEventsByType(params: {
  deviceInfo: DeviceInfo;
  type: 'create' | 'login' | 'logout' | 'server-logout';
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    const { deviceInfo, type, ...query } = fullParams;
    logger.log(`[getAuthEventsByType] Fetching ${type} events`);
    return nestGet<AdminListResponse<AuthEvent>>(session, `admin/auth-events/${type}`, query);
  }, params);
}

// Single Auth Event
export async function getAuthEvent(params: {
  deviceInfo: DeviceInfo;
  eventId: string;
}) {
  return withAdminAuth(async (session, { eventId }) => {
    logger.log('[getAuthEvent] Fetching auth event:', eventId);
    return nestGet<AuthEvent>(session, `admin/auth-events/${eventId}`);
  }, params);
}