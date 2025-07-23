import { AdminStatsQuery, AdminStatsResponseWithQuery, BaseAdminQuery, AdminListResponse } from 'mystyc-common/admin';

import { 
  Session, 
  SessionDevice, 
} from '@/interfaces';
import { SessionStats } from '@/interfaces/admin/stats';

import { logger } from '@/util/logger';
import { BaseAdminClient } from './BaseAdminClient';

export class SessionClient extends BaseAdminClient {
  
  // Session Stats
  getStats = async (query?: Partial<AdminStatsQuery>): Promise<AdminStatsResponseWithQuery<SessionStats>> => {
    try {
      const queryString = this.buildStatsQueryString(query);
      const response = await this.fetchWithAuth(`${this.API_BASE_URL}/admin/stats/sessions${queryString}`);
      return {
        data: response,
        query,
        queryString: queryString.replace('?', '')
      };      
    } catch (error) {
      logger.error('getSessionStats failed:', error);
      throw error;
    }
  };

  // Session Management
  getSessions = async (query?: Partial<BaseAdminQuery>): Promise<AdminListResponse<Session>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/sessions${queryString}`);
    } catch (error) {
      logger.error('getSessions failed:', error);
      throw error;
    }
  };

  getSession = async (sessionId: string): Promise<Session> => {
    try {
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/sessions/${sessionId}`);
    } catch (error) {
      logger.error('getSession failed:', error);
      throw error;
    }
  };

  getSessionsDevices = async (query?: BaseAdminQuery): Promise<AdminListResponse<SessionDevice>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/sessions/devices${queryString}`);
    } catch (error) {
      logger.error('getSessionsDevices failed:', error);
      throw error;
    }
  };

  getSessionDevice = async (deviceId: string): Promise<Session> => {
    try {
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/sessions/devces/${deviceId}`);
    } catch (error) {
      logger.error('getSession failed:', error);
      throw error;
    }
  };
}