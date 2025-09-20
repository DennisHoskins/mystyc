'use server'

import { AdminStatsQuery, AdminListResponse, BaseAdminQuery } from 'mystyc-common/admin';
import { 
  UserProfile,
  Device, 
  AuthEvent, 
  Notification, 
  PaymentHistory,
} from 'mystyc-common/schemas/';
import { UserStats, UsersSummary, UserSummary } from 'mystyc-common/admin/interfaces';
import { DeviceInfo } from '@/interfaces/device-info.interface';
import { logger } from '@/util/logger';
import { withAdminAuth } from '@/server/util/admin/withAdminAuth';
import { nestGet } from '@/server/util/admin/nestClient';

// User Stats
export async function getUserStats(params: {
  deviceInfo: DeviceInfo;
} & Partial<AdminStatsQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getUserStats] Fetching user statistics');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<UserStats>(session, 'admin/stats/users', query);
  }, params);
}

// User Summary
export async function getUsersSummary(params: { deviceInfo: DeviceInfo }) {
  return withAdminAuth(async (session) => {
    logger.log('[getUsersSummary] Fetching users summary');
    return nestGet<UsersSummary>(session, 'admin/users/summary');
  }, params);
}

// Combined Stats + Summary
export async function getUsersSummaryStats(params: {
  deviceInfo: DeviceInfo;
} & Partial<AdminStatsQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getUsersSummaryStats] Fetching combined stats and summary');
    const { deviceInfo, ...query } = fullParams;
    
    const [stats, summary] = await Promise.all([
      nestGet<UserStats>(session, 'admin/stats/users', query),
      nestGet<UsersSummary>(session, 'admin/users/summary')
    ]);
    
    return { stats, summary };
  }, params);
}

// List Operations
export async function getAllUsers(params: {
  deviceInfo: DeviceInfo;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getAllUsers] Fetching all users');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<AdminListResponse<UserProfile>>(session, 'admin/users', query);
  }, params);
}

export async function getUsers(params: {
  deviceInfo: DeviceInfo;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getUsers] Fetching regular users');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<AdminListResponse<UserProfile>>(session, 'admin/users/user', query);
  }, params);
}

export async function getPlusUsers(params: {
  deviceInfo: DeviceInfo;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getPlusUsers] Fetching plus users');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<AdminListResponse<UserProfile>>(session, 'admin/users/plus', query);
  }, params);
}

// Single User Operations
export async function getUser(params: {
  deviceInfo: DeviceInfo;
  firebaseUid: string;
}) {
  return withAdminAuth(async (session, { firebaseUid }) => {
    logger.log('[getUser] Fetching user:', firebaseUid);
    return nestGet<UserProfile>(session, `admin/users/${firebaseUid}`);
  }, params);
}

export async function getUserSummary(params: {
  deviceInfo: DeviceInfo;
  firebaseUid: string;
}) {
  return withAdminAuth(async (session, { firebaseUid }) => {
    logger.log('[getUserSummary] Fetching user summary:', firebaseUid);
    return nestGet<UserSummary>(session, `admin/users/${firebaseUid}/summary`);
  }, params);
}

// User Related Data
export async function getUserDevices(params: {
  deviceInfo: DeviceInfo;
  firebaseUid: string;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    const { deviceInfo, firebaseUid, ...query } = fullParams;
    logger.log('[getUserDevices] Fetching devices for user:', firebaseUid);
    return nestGet<AdminListResponse<Device>>(
      session, 
      `admin/users/${firebaseUid}/devices`,
      query
    );
  }, params);
}

export async function getUserAuthEvents(params: {
  deviceInfo: DeviceInfo;
  firebaseUid: string;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    const { deviceInfo, firebaseUid, ...query } = fullParams;
    logger.log('[getUserAuthEvents] Fetching auth events for user:', firebaseUid);
    return nestGet<AdminListResponse<AuthEvent>>(
      session,
      `admin/users/${firebaseUid}/auth-events`,
      query
    );
  }, params);
}

export async function getUserNotifications(params: {
  deviceInfo: DeviceInfo;
  firebaseUid: string;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    const { deviceInfo, firebaseUid, ...query } = fullParams;
    logger.log('[getUserNotifications] Fetching notifications for user:', firebaseUid);
    return nestGet<AdminListResponse<Notification>>(
      session,
      `admin/users/${firebaseUid}/notifications`,
      query
    );
  }, params);
}

export async function getUserPayments(params: {
  deviceInfo: DeviceInfo;
  firebaseUid: string;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    const { deviceInfo, firebaseUid, ...query } = fullParams;
    logger.log('[getUserPayments] Fetching payments for user:', firebaseUid);
    return nestGet<AdminListResponse<PaymentHistory>>(
      session,
      `admin/users/${firebaseUid}/payments`,
      query
    );
  }, params);
}
