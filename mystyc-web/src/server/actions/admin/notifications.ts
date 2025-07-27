'use server'

import { AdminStatsQuery, AdminListResponse, BaseAdminQuery } from 'mystyc-common/admin';
import { Notification } from 'mystyc-common/schemas/';
import { NotificationStats } from 'mystyc-common/admin/interfaces/stats';
import { DeviceInfo } from '@/interfaces/device-info.interface';
import { logger } from '@/util/logger';
import { withAdminAuth } from '@/server/util/admin/withAdminAuth';
import { nestGet } from '@/server/util/admin/nestClient';

// Notification Stats
export async function getNotificationStats(params: {
  deviceInfo: DeviceInfo;
} & Partial<AdminStatsQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getNotificationStats] Fetching notification statistics');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<NotificationStats>(session, 'admin/stats/notifications', query);
  }, params);
}

// Notification List
export async function getNotifications(params: {
  deviceInfo: DeviceInfo;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getNotifications] Fetching notifications');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<AdminListResponse<Notification>>(session, 'admin/notifications', query);
  }, params);
}

// Single Notification
export async function getNotification(params: {
  deviceInfo: DeviceInfo;
  notificationId: string;
}) {
  return withAdminAuth(async (session, { notificationId }) => {
    logger.log('[getNotification] Fetching notification:', notificationId);
    return nestGet<Notification>(session, `admin/notifications/${notificationId}`);
  }, params);
}