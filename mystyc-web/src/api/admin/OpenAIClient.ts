import { AdminStatsQuery, AdminStatsResponseWithQuery, BaseAdminQuery, AdminListResponse } from 'mystyc-common/admin';
import { OpenAIUsage } from 'mystyc-common/schemas/';
import { OpenAIUsageStats } from 'mystyc-common/admin/interfaces/stats';

import { logger } from '@/util/logger';
import { BaseAdminClient } from './BaseAdminClient';

export class OpenAIClient extends BaseAdminClient {
  
  // OpenAI Stats
  getStats = async (query?: Partial<AdminStatsQuery>): Promise<AdminStatsResponseWithQuery<OpenAIUsageStats>> => {
    try {
      const queryString = this.buildStatsQueryString(query);
      const response = await this.fetchWithAuth(`${this.API_BASE_URL}/admin/stats/openai${queryString}`);
      return {
        data: response,
        query,
        queryString: queryString.replace('?', '')
      };      
    } catch (error) {
      logger.error('getOpenAIUsageStats failed:', error);
      throw error;
    }
  };

  // OpenAI Management
  getOpenAIUsages = async (query?: BaseAdminQuery): Promise<AdminListResponse<OpenAIUsage>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/openai${queryString}`);
    } catch (error) {
      logger.error('getOpenAIUsages failed:', error);
      throw error;
    }
  };

  getOpenAIUsage = async (): Promise<OpenAIUsage> => {
    try {
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/openai/usage`);
    } catch (error) {
      logger.error('getOpenAIUsage failed:', error);
      throw error;
    }
  };
}