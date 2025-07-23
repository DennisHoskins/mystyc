import { AdminStatsQuery, AdminStatsResponseWithQuery, BaseAdminQuery, AdminListResponse } from 'mystyc-common/admin';
import { PaymentHistory } from 'mystyc-common/schemas/';
import { SubscriptionStats } from 'mystyc-common/admin/interfaces/stats';

import { logger } from '@/util/logger';
import { BaseAdminClient } from './BaseAdminClient';

export class PaymentClient extends BaseAdminClient {
  
  // Payment/Subscription Stats
  getStats = async (query?: Partial<AdminStatsQuery>): Promise<AdminStatsResponseWithQuery<SubscriptionStats>> => {
    try {
      const queryString = this.buildStatsQueryString(query);
      const response = await this.fetchWithAuth(`${this.API_BASE_URL}/admin/stats/subscriptions${queryString}`);
      return {
        data: response,
        query,
        queryString: queryString.replace('?', '')
      };      
    } catch (error) {
      logger.error('getSubscriptionStats failed:', error);
      throw error;
    }
  };

  // Payment/Subscription Management
  getSummary = async (): Promise<{
    totalPayments: number;
    totalSubscriptions: number;
  }> => {
    try {
      const results = await this.fetchWithAuth(`${this.API_BASE_URL}/admin/payments/summary`);
      return results;
    } catch (error) {
      logger.error('getSubscriptionsSummary failed:', error);
      throw error;
    }
  };

  getPayments = async (query?: BaseAdminQuery): Promise<AdminListResponse<PaymentHistory>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/payments${queryString}`);
    } catch (error) {
      logger.error('getSubscriptions failed:', error);
      throw error;
    }
  };

  getPayment = async (paymentId: string): Promise<PaymentHistory> => {
    try {
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/payments/${paymentId}`);
    } catch (error) {
      logger.error('getSubscription failed:', error);
      throw error;
    }
  };
}