'use server'

import { AdminStatsQuery, AdminListResponse, BaseAdminQuery } from 'mystyc-common/admin';
import { PaymentHistory } from 'mystyc-common/schemas/';
import { SubscriptionStats, SubscriptionsSummary } from 'mystyc-common/admin/interfaces';
import { DeviceInfo } from '@/interfaces/device-info.interface';
import { logger } from '@/util/logger';
import { withAdminAuth } from '@/server/util/admin/withAdminAuth';
import { nestGet } from '@/server/util/admin/nestClient';

// Payment/Subscription Stats
export async function getSubscriptionStats(params: {
  deviceInfo: DeviceInfo;
} & Partial<AdminStatsQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getSubscriptionStats] Fetching subscription statistics');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<SubscriptionStats>(session, 'admin/stats/subscriptions', query);
  }, params);
}

// Subscriptions Summary
export async function getSubscriptionsSummary(params: { deviceInfo: DeviceInfo }) {
  return withAdminAuth(async (session) => {
    logger.log('[getSubscriptionsSummary] Fetching subscriptions summary');
    return nestGet<SubscriptionsSummary>(session, 'admin/payments/summary');
  }, params);
}

// Combined Stats + Summary
export async function getSubscriptionsSummaryStats(params: {
  deviceInfo: DeviceInfo;
} & Partial<AdminStatsQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getSubscriptionsSummaryStats] Fetching combined stats and summary');
    const { deviceInfo, ...query } = fullParams;
    
    const [stats, summary] = await Promise.all([
      nestGet<SubscriptionStats>(session, 'admin/stats/subscriptions', query),
      nestGet<SubscriptionsSummary>(session, 'admin/payments/summary')
    ]);
    
    return { stats, summary };
  }, params);
}

// Payment List
export async function getPayments(params: {
  deviceInfo: DeviceInfo;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getPayments] Fetching payments');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<AdminListResponse<PaymentHistory>>(session, 'admin/payments', query);
  }, params);
}

// Single Payment
export async function getPayment(params: {
  deviceInfo: DeviceInfo;
  paymentId: string;
}) {
  return withAdminAuth(async (session, { paymentId }) => {
    logger.log('[getPayment] Fetching payment:', paymentId);
    return nestGet<PaymentHistory>(session, `admin/payments/${paymentId}`);
  }, params);
}