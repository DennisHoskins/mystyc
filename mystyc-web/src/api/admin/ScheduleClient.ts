import { AdminStatsQuery, AdminStatsResponseWithQuery, BaseAdminQuery, AdminListResponse } from 'mystyc-common/admin';
import { 
  Schedule, 
  ScheduleExecution,
  Content,
  Notification 
} from 'mystyc-common/schemas/';

import { 
  ScheduleStats,
  ScheduleExecutionStats
} from 'mystyc-common/admin/interfaces/stats';

import { logger } from '@/util/logger';
import { BaseAdminClient } from './BaseAdminClient';

export class ScheduleClient extends BaseAdminClient {
  
  getStats = async (query?: Partial<AdminStatsQuery>): Promise<AdminStatsResponseWithQuery<ScheduleStats>> => {
    try {
      const queryString = this.buildStatsQueryString(query);
      const response = await this.fetchWithAuth(`${this.API_BASE_URL}/admin/stats/schedules${queryString}`);
      return {
        data: response,
        query,
        queryString: queryString.replace('?', '')
      };      
    } catch (error) {
      logger.error('getScheduleStats failed:', error);
      throw error;
    }
  };

  getExecutionStats = async (query?: Partial<AdminStatsQuery>): Promise<AdminStatsResponseWithQuery<ScheduleExecutionStats>> => {
    try {
      const queryString = this.buildStatsQueryString(query);
      const response = await this.fetchWithAuth(`${this.API_BASE_URL}/admin/stats/schedule-executions${queryString}`);
      return {
        data: response,
        query,
        queryString: queryString.replace('?', '')
      };      
    } catch (error) {
      logger.error('getScheduleExecutionStats failed:', error);
      throw error;
    }
  };

  getSchedules = async (query?: BaseAdminQuery): Promise<AdminListResponse<Schedule>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/schedules${queryString}`);
    } catch (error) {
      logger.error('getSchedules failed:', error);
      throw error;
    }
  };

  getTimezones = async (): Promise<Array<{timezone: string, offsetHours: number}>> => {
    try {
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/schedules/timezones`);
    } catch (error) {
      logger.error('getSchedulesTimezones failed:', error);
      throw error;
    }
  };

  getSchedule = async (scheduleId: string): Promise<Schedule> => {
    try {
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/schedules/${scheduleId}`);
    } catch (error) {
      logger.error('getSchedule failed:', error);
      throw error;
    }
  };

  getScheduleExecutions = async (scheduleId: string, query?: BaseAdminQuery): Promise<AdminListResponse<ScheduleExecution>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/schedules/${scheduleId}/executions${queryString}`);
    } catch (error) {
      logger.error('getScheduleExecutions failed:', error);
      throw error;
    }
  };

  getExecutionsSummary = async (executionId: string): Promise<{
    contents: { total: number };
    notifications: { total: number };
  }> => {
    try {
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/schedule-executions/${executionId}/summary`);
    } catch (error) {
      logger.error('getScheduleExecutionsSummary failed:', error);
      throw error;
    }
  };

  getExecutions = async (query?: BaseAdminQuery): Promise<AdminListResponse<ScheduleExecution>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/schedule-executions${queryString}`);
    } catch (error) {
      logger.error('getScheduleExecutions failed:', error);
      throw error;
    }
  };

  getExecution = async (scheduleExecutionId: string): Promise<ScheduleExecution> => {
    try {
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/schedule-executions/${scheduleExecutionId}`);
    } catch (error) {
      logger.error('getScheduleExecution failed:', error);
      throw error;
    }
  };

  getExecutionContent = async (scheduleExecutionId: string, query?: BaseAdminQuery): Promise<AdminListResponse<Content>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/schedule-executions/${scheduleExecutionId}/content${queryString}`);
    } catch (error) {
      logger.error('getScheduleExecutionContent failed:', error);
      throw error;
    }
  };

  getExecutionNotifications = async (scheduleExecutionId: string, query?: BaseAdminQuery): Promise<AdminListResponse<Notification>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/schedule-executions/${scheduleExecutionId}/notifications${queryString}`);
    } catch (error) {
      logger.error('getScheduleExecutionNotifications failed:', error);
      throw error;
    }
  };
}