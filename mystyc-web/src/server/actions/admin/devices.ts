'use server'

import { AdminStatsQuery, AdminListResponse, BaseAdminQuery } from 'mystyc-common/admin';
import { 
  Device, 
  UserProfile, 
  AuthEvent, 
  Notification 
} from 'mystyc-common/schemas/';
import { DeviceStats, DevicesSummary, DeviceSummary } from 'mystyc-common/admin/interfaces';
import { DeviceInfo } from '@/interfaces/device-info.interface';
import { DeviceSession } from '@/interfaces/device-session.interface';
import { logger } from '@/util/logger';
import { withAdminAuth } from '@/server/util/admin/withAdminAuth';
import { nestGet } from '@/server/util/admin/nestClient';
import { sessionManager } from '@/server/services/sessionManager';

// Device Stats
export async function getDeviceStats(params: {
  deviceInfo: DeviceInfo;
} & Partial<AdminStatsQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getDeviceStats] Fetching device statistics');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<DeviceStats>(session, 'admin/stats/devices', query);
  }, params);
}

// Device Summary
export async function getDevicesSummary(params: { deviceInfo: DeviceInfo }) {
  return withAdminAuth(async (session) => {
    logger.log('[getDevicesSummary] Fetching devices summary');
    return nestGet<DevicesSummary>(session, 'admin/devices/summary');
  }, params);
}

// Combined Stats + Summary
export async function getDevicesSummaryStats(params: {
  deviceInfo: DeviceInfo;
} & Partial<AdminStatsQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getDevicesSummaryStats] Fetching combined stats and summary');
    const { deviceInfo, ...query } = fullParams;
    
    const [stats, summary] = await Promise.all([
      nestGet<DeviceStats>(session, 'admin/stats/devices', query),
      nestGet<DevicesSummary>(session, 'admin/devices/summary')
    ]);
    
    return { stats, summary };
  }, params);
}

// List Operations
export async function getDevices(params: {
  deviceInfo: DeviceInfo;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getDevices] Fetching all devices');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<AdminListResponse<Device>>(session, 'admin/devices', query);
  }, params);
}

export async function getOnlineDevices(params: {
  deviceInfo: DeviceInfo;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getOnlineDevices] Fetching online devices');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<AdminListResponse<Device>>(session, 'admin/devices/online', query);
  }, params);
}

export async function getOfflineDevices(params: {
  deviceInfo: DeviceInfo;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getOfflineDevices] Fetching offline devices');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<AdminListResponse<Device>>(session, 'admin/devices/offline', query);
  }, params);
}

// Single Device Operations
export async function getDevice(params: {
  deviceInfo: DeviceInfo;
  deviceId: string;
}) {
  return withAdminAuth(async (session, { deviceId }) => {
    logger.log('[getDevice] Fetching device:', deviceId.substring(0, 8));
    return nestGet<Device>(session, `admin/devices/${deviceId}`);
  }, params);
}

export async function getDeviceSummary(params: {
  deviceInfo: DeviceInfo;
  deviceId: string;
}) {
  return withAdminAuth(async (session, { deviceId }) => {
    logger.log('[getDeviceSummary] Fetching device summary:', deviceId.substring(0, 8));
    return nestGet<DeviceSummary>(session, `admin/devices/${deviceId}/summary`);
  }, params);
}

// Device Session - COMPLEX: Combines Nest device data with Redis session data
export async function getDeviceSession(params: {
  deviceInfo: DeviceInfo;
  deviceId: string;
}): Promise<DeviceSession> {
  return withAdminAuth(async (session, { deviceId }) => {
    logger.log('[getDeviceSession] Getting device session for:', deviceId.substring(0, 8));
    
    // First get device from Nest
    logger.log('[getDeviceSession] Fetching device data from Nest');
    const device = await nestGet<Device>(session, `admin/devices/${deviceId}`);
    
    // Then get session from Redis
    logger.log('[getDeviceSession] Looking up session in Redis for device:', deviceId.substring(0, 8));
    const sessionId = await sessionManager.getDeviceSession(deviceId);
    
    if (!sessionId) {
      logger.log('[getDeviceSession] No session found for device:', deviceId.substring(0, 8));
      return {
        device,
        session: null
      };
    }
    
    logger.log('[getDeviceSession] Found session:', sessionId.substring(0, 8));
    const sessionData = await sessionManager.getSession(sessionId);
    
    logger.log('[getDeviceSession] Device session data combined successfully');
    return {
      device,
      session: sessionData
    };
  }, params);
}

// Device Related Data
export async function getDeviceUsers(params: {
  deviceInfo: DeviceInfo;
  deviceId: string;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    const { deviceInfo, deviceId, ...query } = fullParams;
    logger.log('[getDeviceUsers] Fetching users for device:', deviceId.substring(0, 8));
    return nestGet<AdminListResponse<UserProfile>>(
      session,
      `admin/devices/${deviceId}/users`,
      query
    );
  }, params);
}

export async function getDeviceAuthEvents(params: {
  deviceInfo: DeviceInfo;
  deviceId: string;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    const { deviceInfo, deviceId, ...query } = fullParams;
    logger.log('[getDeviceAuthEvents] Fetching auth events for device:', deviceId.substring(0, 8));
    return nestGet<AdminListResponse<AuthEvent>>(
      session,
      `admin/devices/${deviceId}/auth-events`,
      query
    );
  }, params);
}

export async function getDeviceNotifications(params: {
  deviceInfo: DeviceInfo;
  deviceId: string;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    const { deviceInfo, deviceId, ...query } = fullParams;
    logger.log('[getDeviceNotifications] Fetching notifications for device:', deviceId.substring(0, 8));
    return nestGet<AdminListResponse<Notification>>(
      session,
      `admin/devices/${deviceId}/notifications`,
      query
    );
  }, params);
}