import { AdminQuery, Session, SessionDevice, UserProfile, Device, DeviceSession, AuthEvent, Notification } from '@/interfaces';
import { getDeviceInfo } from './apiClient';
import { logger } from '@/util/logger';

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
    const response = await fetch(url, {
      method: 'POST',
      ...options,
      body: options.body ? JSON.stringify({
        ...JSON.parse(options.body as string),
        deviceInfo: getDeviceInfo(),
        clientTimestamp: new Date().toISOString()
      }) : JSON.stringify({
        deviceInfo: getDeviceInfo(),
        clientTimestamp: new Date().toISOString()
      }),
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
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



  // 
  // todo: dashboard
  //

  // get better summary


  //
  // Session Management
  //
  getSessions = async (query?: AdminQuery): Promise<PaginatedResponse<Session>> => {
    logger.log('getSessions called', { query });
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/sessions${queryString}`);
    } catch (error) {
      logger.error('getSessions failed:', error);
      throw error;
    }
  };

  getSession = async (sessionId: string): Promise<Session> => {
    logger.log('getSession called', { sessionId });
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/sessions/${sessionId}`);
    } catch (error) {
      logger.error('getSession failed:', error);
      throw error;
    }
  };

  getSessionsDevices = async (query?: AdminQuery): Promise<PaginatedResponse<SessionDevice>> => {
    logger.log('getSessionsDevices called', { query });
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/sessions/devices${queryString}`);
    } catch (error) {
      logger.error('getSessionsDevices failed:', error);
      throw error;
    }
  };

  getSessionDevice = async (deviceId: string): Promise<Session> => {
    logger.log('getSession called', { deviceId });
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/sessions/devces/${deviceId}`);
    } catch (error) {
      logger.error('getSession failed:', error);
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
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/users/${firebaseUid}/summary`);
    } catch (error) {
      logger.error('getUserSummary failed:', error);
      throw error;
    }
  };

  getUsers = async (query?: AdminQuery): Promise<PaginatedResponse<UserProfile>> => {
    logger.log('getUsers called', { query });
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/users${queryString}`);
    } catch (error) {
      logger.error('getUsers failed:', error);
      throw error;
    }
  };

  getUser = async (firebaseUid: string): Promise<UserProfile> => {
    logger.log('getUser called', { firebaseUid });
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/users/${firebaseUid}`);
    } catch (error) {
      logger.error('getUser failed:', error);
      throw error;
    }
  };

  getUserDevices = async (firebaseUid: string, query?: AdminQuery): Promise<PaginatedResponse<Device>> => {
    logger.log('getUserDevices called', { firebaseUid, query });
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/users/${firebaseUid}/devices${queryString}`);
    } catch (error) {
      logger.error('getUserDevices failed:', error);
      throw error;
    }
  };

  getUserAuthEvents = async (firebaseUid: string, query?: AdminQuery): Promise<PaginatedResponse<AuthEvent>> => {
    logger.log('getUserAuthEvents called', { firebaseUid });
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/users/${firebaseUid}/auth-events${queryString}`);
    } catch (error) {
      logger.error('getUserAuthEvents failed:', error);
      throw error;
    }
  };

  getUserNotifications = async (firebaseUid: string, query?: AdminQuery): Promise<PaginatedResponse<Notification>> => {
    logger.log('getUserNotifications called', { firebaseUid });
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/users/${firebaseUid}/notifications${queryString}`);
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
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/devices/${deviceId}/summary`);
    } catch (error) {
      logger.error('getDeviceSummary failed:', error);
      throw error;
    }
  };

  getDevices = async (query?: AdminQuery): Promise<PaginatedResponse<Device>> => {
    logger.log('getDevices called', { query });
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/devices${queryString}`);
    } catch (error) {
      logger.error('getDevices failed:', error);
      throw error;
    }
  };

  getDeviceSession = async (deviceId: string): Promise<DeviceSession> => {
    logger.log('getDeviceSession called', { deviceId });
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/devices/${deviceId}/session`);
    } catch (error) {
      logger.error('getDeviceSession failed:', error);
      throw error;
    }
  };

  getDevice = async (deviceId: string): Promise<Device> => {
    logger.log('getDevice called', { deviceId });
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/devices/${deviceId}`);
    } catch (error) {
      logger.error('getDevice failed:', error);
      throw error;
    }
  };

  getDeviceUsers = async (deviceId: string, query?: AdminQuery): Promise<PaginatedResponse<UserProfile>> => {
    logger.log('getDeviceUsers called', { deviceId });
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/devices/${deviceId}/users${queryString}`);
    } catch (error) {
      logger.error('getDeviceUsers failed:', error);
      throw error;
    }
  };

  getDeviceAuthEvents = async (deviceId: string, query?: AdminQuery): Promise<PaginatedResponse<AuthEvent>> => {
    logger.log('getDeviceAuthEvents called', { deviceId });
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/devices/${deviceId}/auth-events${queryString}`
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
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/devices/${deviceId}/notifications${queryString}`);
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
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/auth-events${queryString}`);
    } catch (error) {
      logger.error('getAuthEvents failed:', error);
      throw error;
    }
  };

  getAuthEvent = async (eventId: string): Promise<AuthEvent> => {
    logger.log('getAuthEvent called', { eventId });
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/auth-events/${eventId}`);
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
      const response = await this.fetchWithAuth(`${API_BASE_URL}/admin/notifications${queryString}`);
      return response;
    } catch (error) {
      logger.error('getNotifications failed:', error);
      throw error;
    }
  };

  getNotification = async (notificationId: string): Promise<Notification> => {
    logger.log('getNotification called', { notificationId });
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/notifications/${notificationId}`);
    } catch (error) {
      logger.error('getNotification failed:', error);
      throw error;
    }
  };

  sendTestNotification = async (deviceId: string): Promise<void> => {
    logger.log('sendTestNotification called', { deviceId });
    try {
      await this.fetchWithAuth(`${API_BASE_URL}/admin/notifications/test`, {
        method: 'POST',
        body: JSON.stringify({ deviceId }),
      });
    } catch (error) {
      logger.error('sendTestNotification failed:', error);
      throw error;
    }
  };

  sendNotification = async (params: {
    title?: string;
    body?: string;
    deviceId?: string;
    firebaseUid?: string;
    broadcast?: boolean;
    test?: boolean;
  }): Promise<void> => {
    logger.log('sendNotification called', params);
    try {
      await this.fetchWithAuth(`${API_BASE_URL}/admin/notifications/send`, {
        method: 'POST',
        body: JSON.stringify(params),
      });
    } catch (error) {
      logger.error('sendNotification failed:', error);
      throw error;
    }
  };
}

export const apiClientAdmin = new AdminApiClient();