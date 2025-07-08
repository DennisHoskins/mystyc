import { 
  AdminQuery, 
  AdminStatsQuery, 
  Session, 
  SessionDevice, 
  UserProfile, 
  Device, 
  DeviceSession, 
  AuthEvent, 
  Notification, 
  Content, 
  AdminStatsResponse, 
  SessionStats, 
  TrafficStats, 
  UserStats, 
  DeviceStats, 
  AuthEventStats, 
  NotificationStats,
  ContentStats,
} from '@/interfaces';
import { getDeviceInfo } from './apiClient';
import { logger } from '@/util/logger';
import { AdminSessionStatsQuery } from '@/interfaces/admin/adminSessionStatsQuery.interface';
import { AdminTrafficStatsQuery } from '@/interfaces/admin/adminTrafficStatsQuery.interface';
import { AdminUserStatsQuery } from '@/interfaces/admin/adminUserStatsQuery.interface';
import { AdminDeviceStatsQuery } from '@/interfaces/admin/adminDeviceStatsQuery.interface';
import { AdminAuthEventStatsQuery } from '@/interfaces/admin/adminAuthEventStatsQuery.interface';
import { AdminNotificationStatsQuery } from '@/interfaces/admin/adminNotificationStatsQuery.interface';
import { AdminContentStatsQuery } from '@/interfaces/admin/adminContentStatsQuery.interface';

const API_BASE_URL = '/api';

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
    totalItems: number;
    totalPages: number;
  };
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

class AdminApiClient {
private async fetchWithAuth(url: string, options: RequestInit = {}) {
    try {
      // Build the body with deviceInfo and any existing body data
      const bodyData = options.body ? JSON.parse(options.body as string) : {};
      const requestBody = {
        ...bodyData,
        deviceInfo: getDeviceInfo(),
        clientTimestamp: new Date().toISOString()
      };

      const response = await fetch(url, {
        method: 'POST',
        ...options,
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        if (errorData?.error === 'InvalidSession') {
          throw new Error('InvalidSession');
        }

        throw new Error(errorData?.message || `HTTP ${response.status}`);
      }

      return response.json();
    } catch(err) {
      logger.error('fetchWithAuth failed:', err);
      throw err;
    }
  }

  private buildQueryString(query?: AdminQuery): string {
    if (!query) return '';
    
    const params = new URLSearchParams();
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.offset) params.append('offset', query.offset.toString());
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);
    
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Dynamically builds query parameters from any nested object structure
   * Handles arrays, nested objects, and primitive values
   */
  private buildQueryParams(obj: any, prefix = ''): URLSearchParams {
    const params = new URLSearchParams();
    
    if (!obj || typeof obj !== 'object') return params;
    
    Object.entries(obj).forEach(([key, value]) => {
      const paramKey = prefix ? `${prefix}.${key}` : key;
      
      if (value === null || value === undefined) {
        // Skip null/undefined values
        return;
      } else if (Array.isArray(value)) {
        // Handle arrays by joining with commas
        if (value.length > 0) {
          params.append(paramKey, value.join(','));
        }
      } else if (typeof value === 'object' && value.constructor === Object) {
        // Recursively handle nested objects
        const nestedParams = this.buildQueryParams(value, paramKey);
        nestedParams.forEach((val, nestedKey) => {
          params.append(nestedKey, val);
        });
      } else {
        // Handle primitive values (string, number, boolean)
        params.append(paramKey, String(value));
      }
    });
    
    return params;
  }

  /**
   * Builds a query string from any query object structure
   */
  private buildStatsQueryString(query?: AdminStatsQuery): string {
    if (!query) return '';
    
    const params = this.buildQueryParams(query);
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Generic method to build query string for individual stats endpoints
   */
  private buildSingleStatsQuery<T>(queryType: string, query?: T): string {
    if (!query) return '';
    
    const wrappedQuery = { [queryType]: query };
    return this.buildStatsQueryString(wrappedQuery);
  }

  // 
  // dashboard/stats
  //
  getDashboard = async (query?: AdminStatsQuery): Promise<AdminStatsResponse> => {
    logger.log('getDashboard called', { query });
    try {
      const queryString = this.buildStatsQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/mystyc/admin/stats${queryString}`);
    } catch (error) {
      logger.error('getDashboard failed:', error);
      throw error;
    }
  };

  getSessionStats = async (query?: AdminSessionStatsQuery): Promise<SessionStats> => {
    logger.log('getSessionStats called', { query });
    try {
      const queryString = this.buildSingleStatsQuery('sessions', query);
      return await this.fetchWithAuth(`${API_BASE_URL}/mystyc/admin/stats/sessions${queryString}`);
    } catch (error) {
      logger.error('getSessionStats failed:', error);
      throw error;
    }
  };

  getTrafficStats = async (query?: AdminTrafficStatsQuery): Promise<TrafficStats> => {
    logger.log('getTrafficStats called', { query });
    try {
      const queryString = this.buildSingleStatsQuery('', query);
      return await this.fetchWithAuth(`${API_BASE_URL}/mystyc/admin/stats/traffic${queryString}`);
    } catch (error) {
      logger.error('getTrafficStats failed:', error);
      throw error;
    }
  };

  getContentStats = async (query?: AdminContentStatsQuery): Promise<ContentStats> => {
    logger.log('getContentStats called', { query });
    try {
      const queryString = this.buildSingleStatsQuery('content', query);
      return await this.fetchWithAuth(`${API_BASE_URL}/mystyc/admin/stats/content${queryString}`);
    } catch (error) {
      logger.error('getContentStats failed:', error);
      throw error;
    }
  };

  getUserStats = async (query?: AdminUserStatsQuery): Promise<UserStats> => {
    logger.log('getUserStats called', { query });
    try {
      const queryString = this.buildSingleStatsQuery('users', query);
      return await this.fetchWithAuth(`${API_BASE_URL}/mystyc/admin/stats/users${queryString}`);
    } catch (error) {
      logger.error('getUserStats failed:', error);
      throw error;
    }
  };

  getDeviceStats = async (query?: AdminDeviceStatsQuery): Promise<DeviceStats> => {
    logger.log('getDeviceStats called', { query });
    try {
      const queryString = this.buildSingleStatsQuery('devices', query);
      return await this.fetchWithAuth(`${API_BASE_URL}/mystyc/admin/stats/devices${queryString}`);
    } catch (error) {
      logger.error('getDeviceStats failed:', error);
      throw error;
    }
  };

  getAuthenticationStats = async (query?: AdminAuthEventStatsQuery): Promise<AuthEventStats> => {
    logger.log('getAuthenticationStats called', { query });
    try {
      const queryString = this.buildSingleStatsQuery('authEvents', query);
      return await this.fetchWithAuth(`${API_BASE_URL}/mystyc/admin/stats/auth-events${queryString}`);
    } catch (error) {
      logger.error('getAuthenticationStats failed:', error);
      throw error;
    }
  };

  getNotificationStats = async (query?: AdminNotificationStatsQuery): Promise<NotificationStats> => {
    logger.log('getNotificationStats called', { query });
    try {
      const queryString = this.buildSingleStatsQuery('notifications', query);
      return await this.fetchWithAuth(`${API_BASE_URL}/mystyc/admin/stats/notifications${queryString}`);
    } catch (error) {
      logger.error('getNotificationStats failed:', error);
      throw error;
    }
  };

  //
  // Session Management
  //
  getSessions = async (query?: AdminQuery): Promise<PaginatedResponse<Session>> => {
    logger.log('getSessions called', { query });
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/mystyc/admin/sessions${queryString}`);
    } catch (error) {
      logger.error('getSessions failed:', error);
      throw error;
    }
  };

  getSession = async (sessionId: string): Promise<Session> => {
    logger.log('getSession called', { sessionId });
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/mystyc/admin/sessions/${sessionId}`);
    } catch (error) {
      logger.error('getSession failed:', error);
      throw error;
    }
  };

  getSessionsDevices = async (query?: AdminQuery): Promise<PaginatedResponse<SessionDevice>> => {
    logger.log('getSessionsDevices called', { query });
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/mystyc/admin/sessions/devices${queryString}`);
    } catch (error) {
      logger.error('getSessionsDevices failed:', error);
      throw error;
    }
  };

  getSessionDevice = async (deviceId: string): Promise<Session> => {
    logger.log('getSession called', { deviceId });
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/mystyc/admin/sessions/devces/${deviceId}`);
    } catch (error) {
      logger.error('getSession failed:', error);
      throw error;
    }
  };


  //
  //  Content Management
  //
  getContents = async (query?: AdminQuery): Promise<PaginatedResponse<Content>> => {
    logger.log('getContents called', { query });
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/mystyc/admin/content${queryString}`);
    } catch (error) {
      logger.error('getContents failed:', error);
      throw error;
    }
  };

  getContent = async (firebaseUid: string): Promise<Content> => {
    logger.log('getContent called', { firebaseUid });
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/mystyc/admin/content/${firebaseUid}`);
    } catch (error) {
      logger.error('getContent failed:', error);
      throw error;
    }
  };

  //
  // User Management
  //
  getUserSummary = async (firebaseUid: string): Promise<{
    authEvents: { total: number };
    notifications: { total: number };
  }> => {
    logger.log('getUserSummary called', { firebaseUid });
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/mystyc/admin/users/${firebaseUid}/summary`);
    } catch (error) {
      logger.error('getUserSummary failed:', error);
      throw error;
    }
  };

  getUsers = async (query?: AdminQuery): Promise<PaginatedResponse<UserProfile>> => {
    logger.log('getUsers called', { query });
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/mystyc/admin/users${queryString}`);
    } catch (error) {
      logger.error('getUsers failed:', error);
      throw error;
    }
  };

  getUser = async (firebaseUid: string): Promise<UserProfile> => {
    logger.log('getUser called', { firebaseUid });
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/mystyc/admin/users/${firebaseUid}`);
    } catch (error) {
      logger.error('getUser failed:', error);
      throw error;
    }
  };

  getUserDevices = async (firebaseUid: string, query?: AdminQuery): Promise<PaginatedResponse<Device>> => {
    logger.log('getUserDevices called', { firebaseUid, query });
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/mystyc/admin/users/${firebaseUid}/devices${queryString}`);
    } catch (error) {
      logger.error('getUserDevices failed:', error);
      throw error;
    }
  };

  getUserAuthEvents = async (firebaseUid: string, query?: AdminQuery): Promise<PaginatedResponse<AuthEvent>> => {
    logger.log('getUserAuthEvents called', { firebaseUid });
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/mystyc/admin/users/${firebaseUid}/auth-events${queryString}`);
    } catch (error) {
      logger.error('getUserAuthEvents failed:', error);
      throw error;
    }
  };

  getUserNotifications = async (firebaseUid: string, query?: AdminQuery): Promise<PaginatedResponse<Notification>> => {
    logger.log('getUserNotifications called', { firebaseUid });
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/mystyc/admin/users/${firebaseUid}/notifications${queryString}`);
    } catch (error) {
      logger.error('getUserNotifications failed:', error);
      throw error;
    }
  };

  //
  // Device Management
  //
  getDeviceSummary = async (deviceId: string): Promise<{
    authEvents: { total: number };
    notifications: { total: number };
  }> => {
    logger.log('getDeviceSummary called', { deviceId });
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/mystyc/admin/devices/${deviceId}/summary`);
    } catch (error) {
      logger.error('getDeviceSummary failed:', error);
      throw error;
    }
  };

  getDevices = async (query?: AdminQuery): Promise<PaginatedResponse<Device>> => {
    logger.log('getDevices called', { query });
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/mystyc/admin/devices${queryString}`);
    } catch (error) {
      logger.error('getDevices failed:', error);
      throw error;
    }
  };

  getDeviceSession = async (deviceId: string): Promise<DeviceSession> => {
    logger.log('getDeviceSession called', { deviceId });
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/mystyc/admin/devices/${deviceId}/session`);
    } catch (error) {
      logger.error('getDeviceSession failed:', error);
      throw error;
    }
  };

  getDevice = async (deviceId: string): Promise<Device> => {
    logger.log('getDevice called', { deviceId });
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/mystyc/admin/devices/${deviceId}`);
    } catch (error) {
      logger.error('getDevice failed:', error);
      throw error;
    }
  };

  getDeviceUsers = async (deviceId: string, query?: AdminQuery): Promise<PaginatedResponse<UserProfile>> => {
    logger.log('getDeviceUsers called', { deviceId });
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/mystyc/admin/devices/${deviceId}/users${queryString}`);
    } catch (error) {
      logger.error('getDeviceUsers failed:', error);
      throw error;
    }
  };

  getDeviceAuthEvents = async (deviceId: string, query?: AdminQuery): Promise<PaginatedResponse<AuthEvent>> => {
    logger.log('getDeviceAuthEvents called', { deviceId });
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/mystyc/admin/devices/${deviceId}/auth-events${queryString}`
      );
    } catch (error) {
      logger.error('getDeviceAuthEvents failed:', error);
      throw error;
    }
  };

  getDeviceNotifications = async (deviceId: string, query?: AdminQuery): Promise<PaginatedResponse<Notification>> => {
    logger.log('getDeviceNotifications called', { deviceId });
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/mystyc/admin/devices/${deviceId}/notifications${queryString}`);
    } catch (error) {
      logger.error('getUserNotifications failed:', error);
      throw error;
    }
  };

  //
  // Auth Events Management
  //
  getAuthEvents = async (query?: AdminQuery): Promise<PaginatedResponse<AuthEvent>> => {
    logger.log('getAuthEvents called', { query });
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/mystyc/admin/auth-events${queryString}`);
    } catch (error) {
      logger.error('getAuthEvents failed:', error);
      throw error;
    }
  };

  getAuthEvent = async (eventId: string): Promise<AuthEvent> => {
    logger.log('getAuthEvent called', { eventId });
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/mystyc/admin/auth-events/${eventId}`);
    } catch (error) {
      logger.error('getAuthEvent failed:', error);
      throw error;
    }
  };

  //
  // Notifications Management
  //
  getNotifications = async (query?: AdminQuery): Promise<PaginatedResponse<Notification>> => {
    logger.log('getNotifications called', { query });
    try {
      const queryString = this.buildQueryString(query);
      const response = await this.fetchWithAuth(`${API_BASE_URL}/mystyc/admin/notifications${queryString}`);
      return response;
    } catch (error) {
      logger.error('getNotifications failed:', error);
      throw error;
    }
  };

  getNotification = async (notificationId: string): Promise<Notification> => {
    logger.log('getNotification called', { notificationId });
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/mystyc/admin/notifications/${notificationId}`);
    } catch (error) {
      logger.error('getNotification failed:', error);
      throw error;
    }
  };

  sendNotification = async (
    deviceId:string,
    title:string,
    notification:string
  ): Promise<any> => {
    logger.log('sendNotification called', deviceId, title, notification);
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/mystyc/admin/notifications/send/${deviceId}`, {
        method: 'POST',
        body: JSON.stringify({
          title,
          notification
        }),
      });
    } catch (error) {
      logger.error('sendNotification failed:', error);
      throw error;
    }
  };
}

export const apiClientAdmin = new AdminApiClient();