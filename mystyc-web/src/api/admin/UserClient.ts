import { AdminStatsQuery, AdminStatsResponseWithQuery, BaseAdminQuery, AdminListResponse } from 'mystyc-common/admin';
import { 
  UserProfile,
  Device, 
  Content, 
  AuthEvent, 
  Notification, 
  PaymentHistory 
} from 'mystyc-common/schemas/';
import { UserStats, UsersSummary } from 'mystyc-common/admin/interfaces';

import { logger } from '@/util/logger';
import { BaseAdminClient } from './BaseAdminClient';

export class UserClient extends BaseAdminClient {
  
  getStats = async (query?: Partial<AdminStatsQuery>): Promise<AdminStatsResponseWithQuery<UserStats>> => {
    try {
      const queryString = this.buildStatsQueryString(query);
      const response = await this.fetchWithAuth(`${this.API_BASE_URL}/admin/stats/users${queryString}`);
      return {
        data: response,
        query,
        queryString: queryString.replace('?', '')
      };      
    } catch (error) {
      logger.error('getUserStats failed:', error);
      throw error;
    }
  };

  getSummary = async (): Promise<UsersSummary> => {
    try {
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/users/summary`);
    } catch (error) {
      logger.error('getUsersSummary failed:', error);
      throw error;
    }
  };

  getSummaryStats = async (query?: Partial<AdminStatsQuery>): Promise<{
    stats: AdminStatsResponseWithQuery<UserStats>,
    summary: UsersSummary
  }> => {
    try {
      const stats = await this.getStats(query);
      const summary = await this.getSummary();
      return {
        stats: stats,
        summary: summary
      }
    } catch (error) {
      logger.error('getUsersSummary failed:', error);
      throw error;
    }
  };

  getAll = async (query?: BaseAdminQuery): Promise<AdminListResponse<UserProfile>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/users${queryString}`);
    } catch (error) {
      logger.error('getUsers failed:', error);
      throw error;
    }
  };

  getUsers = async (query?: BaseAdminQuery): Promise<AdminListResponse<UserProfile>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/users/user${queryString}`);
    } catch (error) {
      logger.error('getUsers failed:', error);
      throw error;
    }
  };

  getPlusUsers = async (query?: BaseAdminQuery): Promise<AdminListResponse<UserProfile>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/users/plus${queryString}`);
    } catch (error) {
      logger.error('getUsersPlus failed:', error);
      throw error;
    }
  };

  getUser = async (firebaseUid: string): Promise<UserProfile> => {
    try {
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/users/${firebaseUid}`);
    } catch (error) {
      logger.error('getUser failed:', error);
      throw error;
    }
  };

  getUserSummary = async (firebaseUid: string): Promise<{
    content: { total: number };
    requests: { total: number };
    authEvents: { total: number };
    notifications: { total: number };
    payments: { total: number };
  }> => {
    try {
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/users/${firebaseUid}/summary`);
    } catch (error) {
      logger.error('getUserSummary failed:', error);
      throw error;
    }
  };

  getUserDevices = async (firebaseUid: string, query?: BaseAdminQuery): Promise<AdminListResponse<Device>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/users/${firebaseUid}/devices${queryString}`);
    } catch (error) {
      logger.error('getUserDevices failed:', error);
      throw error;
    }
  };

  getUserContent = async (firebaseUid: string, query?: BaseAdminQuery): Promise<AdminListResponse<Content>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/users/${firebaseUid}/content${queryString}`);
    } catch (error) {
      logger.error('getUserContent failed:', error);
      throw error;
    }
  };

  getUserAuthEvents = async (firebaseUid: string, query?: BaseAdminQuery): Promise<AdminListResponse<AuthEvent>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/users/${firebaseUid}/auth-events${queryString}`);
    } catch (error) {
      logger.error('getUserAuthEvents failed:', error);
      throw error;
    }
  };

  getUserNotifications = async (firebaseUid: string, query?: BaseAdminQuery): Promise<AdminListResponse<Notification>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/users/${firebaseUid}/notifications${queryString}`);
    } catch (error) {
      logger.error('getUserNotifications failed:', error);
      throw error;
    }
  };

  getUserPayments = async (firebaseUid: string, query?: BaseAdminQuery): Promise<AdminListResponse<PaymentHistory>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/users/${firebaseUid}/payments${queryString}`);
    } catch (error) {
      logger.error('getUserPayments failed:', error);
      throw error;
    }
  };
}