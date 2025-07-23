import { AdminStatsQuery, AdminStatsResponseWithQuery } from 'mystyc-common/admin';
import { 
  TrafficStats, 
  AdminStatsResponseExtended,
} from '@/interfaces/admin/stats';

import { logger } from '@/util/logger';
import { BaseAdminClient } from './BaseAdminClient';

export class StatsClient extends BaseAdminClient {
  
  // Cross-domain stats only
  getDashboard = async (query?: Partial<AdminStatsQuery>): Promise<AdminStatsResponseWithQuery<AdminStatsResponseExtended>> => {
    try {
      const queryString = this.buildStatsQueryString(query);
      const response = await this.fetchWithAuth(`${this.API_BASE_URL}/admin/stats${queryString}`);
      return {
        data: response,
        query,
        queryString: queryString.replace('?', '')
      };      
    } catch (error) {
      logger.error('getDashboard failed:', error);
      throw error;
    }
  };

  getTrafficStats = async (query?: Partial<AdminStatsQuery>): Promise<AdminStatsResponseWithQuery<TrafficStats>> => {
    try {
      const queryString = this.buildStatsQueryString(query);
      const response = await this.fetchWithAuth(`${this.API_BASE_URL}/admin/stats/traffic${queryString}`);
      return {
        data: response,
        query,
        queryString: queryString.replace('?', '')
      };      
    } catch (error) {
      logger.error('getTrafficStats failed:', error);
      throw error;
    }
  };
}