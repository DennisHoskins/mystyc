import { AdminStatsQuery, AdminStatsResponseWithQuery, BaseAdminQuery, AdminListResponse } from 'mystyc-common/admin';
import { AuthEvent } from 'mystyc-common/schemas/';

import { AuthEventStats } from 'mystyc-common/admin/interfaces/stats';
import { AuthEventsSummary } from 'mystyc-common/admin/interfaces/summary';

import { logger } from '@/util/logger';
import { BaseAdminClient } from './BaseAdminClient';

export class AuthEventClient extends BaseAdminClient {
  
  getStats = async (query?: Partial<AdminStatsQuery>): Promise<AdminStatsResponseWithQuery<AuthEventStats>> => {
    try {
      const queryString = this.buildStatsQueryString(query);
      const response = await this.fetchWithAuth(`${this.API_BASE_URL}/admin/stats/auth-events${queryString}`);
      return {
        data: response,
        query,
        queryString: queryString.replace('?', '')
      };      
    } catch (error) {
      logger.error('getAuthenticationStats failed:', error);
      throw error;
    }
  };

  getSummary = async (): Promise<AuthEventsSummary> => {
    try {
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/auth-events/summary`);
    } catch (error) {
      logger.error('getAuthEventsSummary failed:', error);
      throw error;
    }
  };

  getSummaryStats = async (): Promise<AuthEventsSummary> => {
    try {
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/auth-events/summary`);
    } catch (error) {
      logger.error('getAuthEventsSummary failed:', error);
      throw error;
    }
  };

  getAuthEvents = async (query?: BaseAdminQuery): Promise<AdminListResponse<AuthEvent>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/auth-events${queryString}`);
    } catch (error) {
      logger.error('getAuthEvents failed:', error);
      throw error;
    }
  };

  getAuthEventsByType = async (type: 'create' | 'login' | 'logout' | 'server-logout', query?: BaseAdminQuery): Promise<AdminListResponse<AuthEvent>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/auth-events/${type}/${queryString}`);
    } catch (error) {
      logger.error('getAuthEvents failed:', error);
      throw error;
    }
  };

  getAuthEvent = async (eventId: string): Promise<AuthEvent> => {
    try {
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/auth-events/${eventId}`);
    } catch (error) {
      logger.error('getAuthEvent failed:', error);
      throw error;
    }
  };
}