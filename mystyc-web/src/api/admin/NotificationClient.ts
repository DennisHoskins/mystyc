import { AdminStatsQuery, AdminStatsResponseWithQuery, BaseAdminQuery, AdminListResponse } from 'mystyc-common/admin';
import { Notification } from 'mystyc-common/schemas/';
import { NotificationStats } from 'mystyc-common/admin/interfaces/stats';

import { logger } from '@/util/logger';
import { BaseAdminClient } from './BaseAdminClient';

export class NotificationClient extends BaseAdminClient {
  
  // Notification Stats
  getStats = async (query?: Partial<AdminStatsQuery>): Promise<AdminStatsResponseWithQuery<NotificationStats>> => {
    try {
      const queryString = this.buildStatsQueryString(query);
      const response = await this.fetchWithAuth(`${this.API_BASE_URL}/admin/stats/notifications${queryString}`);
      return {
        data: response,
        query,
        queryString: queryString.replace('?', '')
      };      
    } catch (error) {
      logger.error('getNotificationStats failed:', error);
      throw error;
    }
  };

  // Notification Management
  getNotifications = async (query?: BaseAdminQuery): Promise<AdminListResponse<Notification>> => {
    try {
      const queryString = this.buildQueryString(query);
      const response = await this.fetchWithAuth(`${this.API_BASE_URL}/admin/notifications${queryString}`);
      return response;
    } catch (error) {
      logger.error('getNotifications failed:', error);
      throw error;
    }
  };

  getNotification = async (notificationId: string): Promise<Notification> => {
    try {
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/notifications/${notificationId}`);
    } catch (error) {
      logger.error('getNotification failed:', error);
      throw error;
    }
  };
}