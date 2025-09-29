'use server'

import { AdminStatsQuery, AdminListResponse, BaseAdminQuery } from 'mystyc-common/admin';
import { OpenAIUsage } from 'mystyc-common/schemas/';
import { OpenAIUsageStats } from 'mystyc-common/admin/interfaces/stats';
import { DeviceInfo } from '@/interfaces/device-info.interface';
import { logger } from '@/util/logger';
import { withAdminAuth } from '@/server/util/admin/withAdminAuth';
import { nestGet } from '@/server/util/admin/nestClient';

// OpenAI Stats
export async function getOpenAIStats(params: {
  deviceInfo: DeviceInfo;
} & Partial<AdminStatsQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getOpenAIStats] Fetching OpenAI statistics');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<OpenAIUsageStats>(session, 'admin/stats/openai', query);
  }, params);
}

// OpenAI Usage List
export async function getOpenAIUsages(params: {
  deviceInfo: DeviceInfo;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getOpenAIUsages] Fetching OpenAI usages');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<AdminListResponse<OpenAIUsage>>(session, 'admin/openai', query);
  }, params);
}

// Current OpenAI Usage
export async function getOpenAIUsage(params: { deviceInfo: DeviceInfo }) {
  return withAdminAuth(async (session) => {
    logger.log('[getOpenAIUsage] Fetching current OpenAI usage');
    return nestGet<OpenAIUsage>(session, 'admin/openai/usage');
  }, params);
}