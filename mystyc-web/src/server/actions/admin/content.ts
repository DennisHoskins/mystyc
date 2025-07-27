'use server'

import { Content } from 'mystyc-common/schemas/';
import { AdminStatsQuery, AdminListResponse, BaseAdminQuery } from 'mystyc-common/admin';
import { ContentStats, ContentsSummary } from 'mystyc-common/admin/interfaces';
import { DeviceInfo } from '@/interfaces/device-info.interface';
import { logger } from '@/util/logger';
import { withAdminAuth } from '@/server/util/admin/withAdminAuth';
import { nestGet } from '@/server/util/admin/nestClient';

// Content Stats
export async function getContentStats(params: {
  deviceInfo: DeviceInfo;
} & Partial<AdminStatsQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getContentStats] Fetching content statistics');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<ContentStats>(session, 'admin/stats/content', query);
  }, params);
}

// Content Summary
export async function getContentsSummary(params: { deviceInfo: DeviceInfo }) {
  return withAdminAuth(async (session) => {
    logger.log('[getContentsSummary] Fetching content summary');
    return nestGet<ContentsSummary>(session, 'admin/content/summary');
  }, params);
}

// Combined Stats + Summary
export async function getContentsSummaryStats(params: {
  deviceInfo: DeviceInfo;
} & Partial<AdminStatsQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getContentsSummaryStats] Fetching combined stats and summary');
    const { deviceInfo, ...query } = fullParams;
    
    const [stats, summary] = await Promise.all([
      nestGet<ContentStats>(session, 'admin/stats/content', query),
      nestGet<ContentsSummary>(session, 'admin/content/summary')
    ]);
    
    return { stats, summary };
  }, params);
}

// List Operations
export async function getContents(params: {
  deviceInfo: DeviceInfo;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getContents] Fetching all content');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<AdminListResponse<Content>>(session, 'admin/content', query);
  }, params);
}

export async function getNotificationsContents(params: {
  deviceInfo: DeviceInfo;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getNotificationsContents] Fetching notification content');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<AdminListResponse<Content>>(session, 'admin/content-notifications', query);
  }, params);
}

export async function getWebsiteContents(params: {
  deviceInfo: DeviceInfo;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getWebsiteContents] Fetching website content');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<AdminListResponse<Content>>(session, 'admin/content-website', query);
  }, params);
}

export async function getUserContents(params: {
  deviceInfo: DeviceInfo;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getUserContents] Fetching user content');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<AdminListResponse<Content>>(session, 'admin/content-users', query);
  }, params);
}

export async function getUserPlusContents(params: {
  deviceInfo: DeviceInfo;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getUserPlusContents] Fetching user plus content');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<AdminListResponse<Content>>(session, 'admin/content-users-plus', query);
  }, params);
}

// Single Content
export async function getContent(params: {
  deviceInfo: DeviceInfo;
  contentId: string;
}) {
  return withAdminAuth(async (session, { contentId }) => {
    logger.log('[getContent] Fetching content:', contentId);
    return nestGet<Content>(session, `admin/content/${contentId}`);
  }, params);
}