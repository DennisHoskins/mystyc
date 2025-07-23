import { AdminStatsQuery, AdminStatsResponseWithQuery, BaseAdminQuery, AdminListResponse } from 'mystyc-common/admin';
import { 
  Device, 
  UserProfile, 
  AuthEvent, 
  Notification 
} from 'mystyc-common/schemas/';
import { DeviceStats } from 'mystyc-common/admin/interfaces/stats';

import { DeviceSession } from '@/interfaces';

import { logger } from '@/util/logger';
import { BaseAdminClient } from './BaseAdminClient';

export class DeviceClient extends BaseAdminClient {
  
  // Device Stats
  getStats = async (query?: Partial<AdminStatsQuery>): Promise<AdminStatsResponseWithQuery<DeviceStats>> => {
    try {
      const queryString = this.buildStatsQueryString(query);
      const response = await this.fetchWithAuth(`${this.API_BASE_URL}/admin/stats/devices${queryString}`);
      return {
        data: response,
        query,
        queryString: queryString.replace('?', '')
      };      
    } catch (error) {
      logger.error('getDeviceStats failed:', error);
      throw error;
    }
  };

  // Device Management
  getSummary = async (deviceId: string): Promise<{
    authEvents: { total: number };
    notifications: { total: number };
  }> => {
    try {
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/devices/${deviceId}/summary`);
    } catch (error) {
      logger.error('getDeviceSummary failed:', error);
      throw error;
    }
  };

  getDevices = async (query?: BaseAdminQuery): Promise<AdminListResponse<Device>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/devices${queryString}`);
    } catch (error) {
      logger.error('getDevices failed:', error);
      throw error;
    }
  };

  getDeviceSession = async (deviceId: string): Promise<DeviceSession> => {
    try {
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/device-sessions/${deviceId}`);
    } catch (error) {
      logger.error('getDeviceSession failed:', error);
      throw error;
    }
  };

  getDevice = async (deviceId: string): Promise<Device> => {
    try {
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/devices/${deviceId}`);
    } catch (error) {
      logger.error('getDevice failed:', error);
      throw error;
    }
  };

  getDeviceUsers = async (deviceId: string, query?: BaseAdminQuery): Promise<AdminListResponse<UserProfile>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/devices/${deviceId}/users${queryString}`);
    } catch (error) {
      logger.error('getDeviceUsers failed:', error);
      throw error;
    }
  };

  getDeviceAuthEvents = async (deviceId: string, query?: BaseAdminQuery): Promise<AdminListResponse<AuthEvent>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/devices/${deviceId}/auth-events${queryString}`
      );
    } catch (error) {
      logger.error('getDeviceAuthEvents failed:', error);
      throw error;
    }
  };

  getDeviceNotifications = async (deviceId: string, query?: BaseAdminQuery): Promise<AdminListResponse<Notification>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${this.API_BASE_URL}/admin/devices/${deviceId}/notifications${queryString}`);
    } catch (error) {
      logger.error('getUserNotifications failed:', error);
      throw error;
    }
  };
}