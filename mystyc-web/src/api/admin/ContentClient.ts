import { AdminStatsQuery, AdminStatsResponseWithQuery, BaseAdminQuery, AdminListResponse } from 'mystyc-common/admin';
import { Content } from 'mystyc-common/schemas/';
import { ContentStats } from 'mystyc-common/admin/interfaces/stats';

import { logger } from '@/util/logger';
import { BaseAdminClient } from './BaseAdminClient';

export class ContentClient extends BaseAdminClient {
  
  // Content Stats
  getStats = async (query?: Partial<AdminStatsQuery>): Promise<AdminStatsResponseWithQuery<ContentStats>> => {
    try {
      const queryString = this.buildStatsQueryString(query);
      const response = await this.fetchWithAuth(`${this.API_BASE_URL}/admin/stats/content${queryString}`);
      return {
        data: response,
        query,
        queryString: queryString.replace('?', '')
      };      
    } catch (error) {
      logger.error('getContentStats failed:', error);
      throw error;
    }
  };

  // Content Management
  getSummary = async (): Promise<{
    content: { total: number };
    notifications: { total: number };
    website: { total: number };
    users: { total: number };
    plus: { total: number };
  }> => {
    try {
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/content/summary`);
    } catch (error) {
      logger.error('getContentSummary failed:', error);
      throw error;
    }
  };

  getContents = async (query?: BaseAdminQuery): Promise<AdminListResponse<Content>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/content${queryString}`);
    } catch (error) {
      logger.error('getContents failed:', error);
      throw error;
    }
  };

  getNotificationsContents = async (query?: BaseAdminQuery): Promise<AdminListResponse<Content>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/content-notifications${queryString}`);
    } catch (error) {
      logger.error('getNotificationsContents failed:', error);
      throw error;
    }
  };

  getWebsiteContents = async (query?: BaseAdminQuery): Promise<AdminListResponse<Content>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/content-website${queryString}`);
    } catch (error) {
      logger.error('getWebsiteContents failed:', error);
      throw error;
    }
  };

  getUserContents = async (query?: BaseAdminQuery): Promise<AdminListResponse<Content>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/content-users${queryString}`);
    } catch (error) {
      logger.error('getUserContents failed:', error);
      throw error;
    }
  };

  getUserPlusContents = async (query?: BaseAdminQuery): Promise<AdminListResponse<Content>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/content-users-plus${queryString}`);
    } catch (error) {
      logger.error('getUserPlusContents failed:', error);
      throw error;
    }
  };

  getContent = async (firebaseUid: string): Promise<Content> => {
    try {
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/content/${firebaseUid}`);
    } catch (error) {
      logger.error('getContent failed:', error);
      throw error;
    }
  };
}