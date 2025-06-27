import { AdminQuery, Session, SessionDevice, User, UserProfile, Device, AuthEvent, Notification } from '@/interfaces';
import { logger } from '@/util/logger';

const API_BASE_URL = '/api';

class AdminApiClient {
  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
      ...options,
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

  //
  // Session Management
  //
  getSessions = async (query?: AdminQuery): Promise<Session[]> => {
    logger.log('getSessions called', { query });
    try {
      const queryString = this.buildQueryString(query);
      const response = await this.fetchWithAuth(`${API_BASE_URL}/admin/sessions${queryString}`);
      return response.data || [];
    } catch (error) {
      logger.error('getSessions failed:', error);
      throw error;
    }
  };

  getSession = async (query?: AdminQuery): Promise<Session> => {
    logger.log('getSession called', { query });
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/session${queryString}`);
    } catch (error) {
      logger.error('getSession failed:', error);
      throw error;
    }
  };

  getSessionsDevices = async (query?: AdminQuery): Promise<SessionDevice[]> => {
    logger.log('getSessionsDevices called', { query });
    try {
      const queryString = this.buildQueryString(query);
      const response = await this.fetchWithAuth(`${API_BASE_URL}/admin/sessions/devices${queryString}`);
      return response.data || [];
    } catch (error) {
      logger.error('getSessionsDevices failed:', error);
      throw error;
    }
  };

  getSessionDevice = async (query?: AdminQuery): Promise<SessionDevice> => {
    logger.log('getSessionDevice called', { query });
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/session/device${queryString}`);
    } catch (error) {
      logger.error('getSessionDevice failed:', error);
      throw error;
    }
  };

  //
  // User Management
  //
  getUsers = async (query?: AdminQuery): Promise<UserProfile[]> => {
    logger.log('getUsers called', { query });
    try {
      const queryString = this.buildQueryString(query);
      const response = await this.fetchWithAuth(`${API_BASE_URL}/admin/users${queryString}`);
      return response.data || [];
    } catch (error) {
      logger.error('getUsers failed:', error);
      throw error;
    }
  };

  getUser = async (firebaseUid: string): Promise<User> => {
    logger.log('getUser called', { firebaseUid });
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/user/${firebaseUid}`);
    } catch (error) {
      logger.error('getUser failed:', error);
      throw error;
    }
  };

  //
  // Device Management
  //
  getDevices = async (query?: AdminQuery): Promise<Device[]> => {
    logger.log('getDevices called', { query });
    try {
      const queryString = this.buildQueryString(query);
      const response = await this.fetchWithAuth(`${API_BASE_URL}/admin/devices${queryString}`);
      return response.data || [];
    } catch (error) {
      logger.error('getDevices failed:', error);
      throw error;
    }
  };

  getDevice = async (deviceId: string): Promise<Device> => {
    logger.log('getDevice called', { deviceId });
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/device/${deviceId}`);
    } catch (error) {
      logger.error('getDevice failed:', error);
      throw error;
    }
  };

  getDeviceUsers = async (deviceId: string): Promise<User[]> => {
    logger.log('getDeviceUsers called', { deviceId });
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/device/${deviceId}/users`);
    } catch (error) {
      logger.error('getDeviceUsers failed:', error);
      throw error;
    }
  };

  getUserDevices = async (firebaseUid: string): Promise<Device[]> => {
    logger.log('getUserDevices called', { firebaseUid });
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/user/${firebaseUid}/devices`);
    } catch (error) {
      logger.error('getUserDevices failed:', error);
      throw error;
    }
  };

  //
  // Auth Events Management
  //
  getAuthEvents = async (query?: AdminQuery): Promise<AuthEvent[]> => {
    logger.log('getAuthEvents called', { query });
    try {
      const queryString = this.buildQueryString(query);
      const response = await this.fetchWithAuth(`${API_BASE_URL}/admin/auth-events${queryString}`);
      return response.data || [];
    } catch (error) {
      logger.error('getAuthEvents failed:', error);
      throw error;
    }
  };

  getAuthEvent = async (eventId: string): Promise<AuthEvent> => {
    logger.log('getAuthEvent called', { eventId });
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/auth-event/${eventId}`);
    } catch (error) {
      logger.error('getAuthEvent failed:', error);
      throw error;
    }
  };

  getUserAuthEvents = async (firebaseUid: string): Promise<AuthEvent[]> => {
    logger.log('getUserAuthEvents called', { firebaseUid });
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/user/${firebaseUid}/auth-events`);
    } catch (error) {
      logger.error('getUserAuthEvents failed:', error);
      throw error;
    }
  };

  getDeviceAuthEvents = async (deviceId: string, limit?: number, offset?: number): Promise<AuthEvent[]> => {
    logger.log('getDeviceAuthEvents called', { deviceId, limit, offset });
    try {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (offset) params.append('offset', offset.toString());
      const queryString = params.toString();
      
      return await this.fetchWithAuth(
        `${API_BASE_URL}/admin/device/${deviceId}/auth-events${queryString ? `?${queryString}` : ''}`
      );
    } catch (error) {
      logger.error('getDeviceAuthEvents failed:', error);
      throw error;
    }
  };

  //
  // Notifications Management
  //
  getNotifications = async (query?: AdminQuery): Promise<Notification[]> => {
    logger.log('getNotifications called', { query });
    try {
      const queryString = this.buildQueryString(query);
      const response = await this.fetchWithAuth(`${API_BASE_URL}/admin/notifications${queryString}`);
      return response.data || [];
    } catch (error) {
      logger.error('getNotifications failed:', error);
      throw error;
    }
  };

  getNotification = async (notificationId: string): Promise<Notification> => {
    logger.log('getNotification called', { notificationId });
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/notification/${notificationId}`);
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