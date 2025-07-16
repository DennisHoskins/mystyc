import { 
  Session, 
  SessionDevice, 
  UserProfile, 
  Device, 
  DeviceSession, 
  AuthEvent, 
  Notification, 
  Content, 
  Schedule, 
  ScheduleExecution,
  OpenAIUsage, 
  AdminQuery, 
  AdminStatsQuery, 
  Subscription,
  AdminStatsResponseExtended, 
  SessionStats, 
  TrafficStats, 
  UserStats, 
  DeviceStats, 
  AuthEventStats, 
  NotificationStats,
  ContentStats,
  ScheduleStats,
  ScheduleExecutionStats,
  OpenAIUsageStats,
  SubscriptionStats,
} from '@/interfaces';
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

export interface StatsResponseWithQuery<T> {
  data: T;
  query?: AdminStatsQuery;
  queryString?: string;
}

class AdminApiClient {
  private async fetchWithAuth(url: string, method?: "GET" | "POST", options: RequestInit = {}) {
    try {
      // Build the body with deviceInfo and any existing body data
      const bodyData = options.body ? JSON.parse(options.body as string) : {};
      const requestBody = {
        ...bodyData,
        method: method,
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

  // 
  // dashboard/stats
  //
 
  getDashboard = async (query?: AdminStatsQuery): Promise<StatsResponseWithQuery<AdminStatsResponseExtended>> => {
    try {
      const queryString = this.buildStatsQueryString(query);
      const response = await this.fetchWithAuth(`${API_BASE_URL}/admin/stats${queryString}`);
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

  getSessionStats = async (query?: AdminStatsQuery): Promise<StatsResponseWithQuery<SessionStats>> => {
    try {
      const queryString = this.buildStatsQueryString(query);
      const response = await this.fetchWithAuth(`${API_BASE_URL}/admin/stats/sessions${queryString}`);
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

  getTrafficStats = async (query?: AdminStatsQuery): Promise<StatsResponseWithQuery<TrafficStats>> => {
    try {
      const queryString = this.buildStatsQueryString(query);
      const response = await this.fetchWithAuth(`${API_BASE_URL}/admin/stats/traffic${queryString}`);
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

  getOpenAIUsageStats = async (query?: AdminStatsQuery): Promise<StatsResponseWithQuery<OpenAIUsageStats>> => {
    try {
      const queryString = this.buildStatsQueryString(query);
      const response = await this.fetchWithAuth(`${API_BASE_URL}/admin/stats/openai${queryString}`);
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

  getSubscriptionStats = async (query?: AdminStatsQuery): Promise<StatsResponseWithQuery<SubscriptionStats>> => {
    try {
      const queryString = this.buildStatsQueryString(query);
      const response = await this.fetchWithAuth(`${API_BASE_URL}/admin/stats/subscriptions${queryString}`);
      return {
        data: response,
        query,
        queryString: queryString.replace('?', '')
      };      
    } catch (error) {
      logger.error('getOpenSubscriptionStats failed:', error);
      throw error;
    }
  };

  getContentStats = async (query?: AdminStatsQuery): Promise<StatsResponseWithQuery<ContentStats>> => {
    try {
      const queryString = this.buildStatsQueryString(query);
      const response = await this.fetchWithAuth(`${API_BASE_URL}/admin/stats/content${queryString}`);
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

  getScheduleStats = async (query?: AdminStatsQuery): Promise<StatsResponseWithQuery<ScheduleStats>> => {
    try {
      const queryString = this.buildStatsQueryString(query);
      const response = await this.fetchWithAuth(`${API_BASE_URL}/admin/stats/schedules${queryString}`);
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

  getScheduleExecutionStats = async (query?: AdminStatsQuery): Promise<StatsResponseWithQuery<ScheduleExecutionStats>> => {
    try {
      const queryString = this.buildStatsQueryString(query);
      const response = await this.fetchWithAuth(`${API_BASE_URL}/admin/stats/schedule-executions${queryString}`);
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

  getUserStats = async (query?: AdminStatsQuery): Promise<StatsResponseWithQuery<UserStats>> => {
    try {
      const queryString = this.buildStatsQueryString(query);
      const response = await this.fetchWithAuth(`${API_BASE_URL}/admin/stats/users${queryString}`);
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

  getDeviceStats = async (query?: AdminStatsQuery): Promise<StatsResponseWithQuery<DeviceStats>> => {
    try {
      const queryString = this.buildStatsQueryString(query);
      const response = await this.fetchWithAuth(`${API_BASE_URL}/admin/stats/devices${queryString}`);
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

  getAuthenticationStats = async (query?: AdminStatsQuery): Promise<StatsResponseWithQuery<AuthEventStats>> => {
    try {
      const queryString = this.buildStatsQueryString(query);
      const response = await this.fetchWithAuth(`${API_BASE_URL}/admin/stats/auth-events${queryString}`);
      return {
        data: response,
        query,
        queryString: queryString.replace('?', '')
      };      
    } catch (error) {
      logger.error('getAuthenticationStats failed:', error);
      throw error;
    }
  };

  getNotificationStats = async (query?: AdminStatsQuery): Promise<StatsResponseWithQuery<NotificationStats>> => {
    try {
      const queryString = this.buildStatsQueryString(query);
      const response = await this.fetchWithAuth(`${API_BASE_URL}/admin/stats/notifications${queryString}`);
      return {
        data: response,
        query,
        queryString: queryString.replace('?', '')
      };      
    } catch (error) {
      logger.error('getNotificationStats failed:', error);
      throw error;
    }
  };

  //
  // Session Management
  //

  getSessions = async (query?: AdminQuery): Promise<PaginatedResponse<Session>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/sessions${queryString}`);
    } catch (error) {
      logger.error('getSessions failed:', error);
      throw error;
    }
  };

  getSession = async (sessionId: string): Promise<Session> => {
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/sessions/${sessionId}`);
    } catch (error) {
      logger.error('getSession failed:', error);
      throw error;
    }
  };

  getSessionsDevices = async (query?: AdminQuery): Promise<PaginatedResponse<SessionDevice>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/sessions/devices${queryString}`);
    } catch (error) {
      logger.error('getSessionsDevices failed:', error);
      throw error;
    }
  };

  getSessionDevice = async (deviceId: string): Promise<Session> => {
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/sessions/devces/${deviceId}`);
    } catch (error) {
      logger.error('getSession failed:', error);
      throw error;
    }
  };

  //
  //  Content Management
  //

  getContentsSummary = async (): Promise<{
    content: { total: number };
    notifications: { total: number };
    website: { total: number };
    users: { total: number };
  }> => {
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/content/summary`);
    } catch (error) {
      logger.error('getContentSummary failed:', error);
      throw error;
    }
  };

  getContents = async (query?: AdminQuery): Promise<PaginatedResponse<Content>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/content${queryString}`);
    } catch (error) {
      logger.error('getContents failed:', error);
      throw error;
    }
  };

  getNotificationsContents = async (query?: AdminQuery): Promise<PaginatedResponse<Content>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/content-notifications${queryString}`);
    } catch (error) {
      logger.error('getNotificationsContents failed:', error);
      throw error;
    }
  };

  getWebsiteContents = async (query?: AdminQuery): Promise<PaginatedResponse<Content>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/content-website${queryString}`);
    } catch (error) {
      logger.error('getWebsiteContents failed:', error);
      throw error;
    }
  };

  getUserContents = async (query?: AdminQuery): Promise<PaginatedResponse<Content>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/content-users${queryString}`);
    } catch (error) {
      logger.error('getUserContents failed:', error);
      throw error;
    }
  };

  getContent = async (firebaseUid: string): Promise<Content> => {
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/content/${firebaseUid}`);
    } catch (error) {
      logger.error('getContent failed:', error);
      throw error;
    }
  };

  createContent = async (prompt: string): Promise<Content> => {
    try {
      return await this.fetchWithAuth(
        `${API_BASE_URL}/admin/content`, 
        "POST",
        {body: JSON.stringify({
          prompt,
          clientTimestamp: new Date().toISOString()
        }),
      });
    } catch (error) {
      logger.error('createContent failed:', error);
      throw error;
    }
  };

  //
  //  OpenAI Management
  //

  getOpenAIUsages = async (query?: AdminQuery): Promise<PaginatedResponse<OpenAIUsage>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/openai${queryString}`);
    } catch (error) {
      logger.error('getOpenAIUsages failed:', error);
      throw error;
    }
  };

  getOpenAIUsage = async (): Promise<OpenAIUsage> => {
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/openai/usage`);
    } catch (error) {
      logger.error('getOpenAIUsage failed:', error);
      throw error;
    }
  };

  //
  //  Subscription Management
  //

  getSubscriptions = async (query?: AdminQuery): Promise<PaginatedResponse<Subscription>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/subscriptions${queryString}`);
    } catch (error) {
      logger.error('getSubscriptions failed:', error);
      throw error;
    }
  };

  getSubscription = async (): Promise<Subscription> => {
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/subscriptions`);
    } catch (error) {
      logger.error('getSubscription failed:', error);
      throw error;
    }
  };

  //
  //  Schedule Management
  //

  getSchedules = async (query?: AdminQuery): Promise<PaginatedResponse<Schedule>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/schedules${queryString}`);
    } catch (error) {
      logger.error('getSchedules failed:', error);
      throw error;
    }
  };

  getSchedulesTimezones = async (): Promise<Array<{timezone: string, offsetHours: number}>> => {
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/schedules/timezones`);
    } catch (error) {
      logger.error('getSchedulesTimezones failed:', error);
      throw error;
    }
  };

  getSchedule = async (scheduleId: string): Promise<Schedule> => {
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/schedules/${scheduleId}`);
    } catch (error) {
      logger.error('getSchedule failed:', error);
      throw error;
    }
  };

  getScheduleScheduleExecutions = async (scheduleId: string, query?: AdminQuery): Promise<PaginatedResponse<ScheduleExecution>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/schedules/${scheduleId}/executions${queryString}`);
    } catch (error) {
      logger.error('getScheduleScheduleExecutions failed:', error);
      throw error;
    }
  };

  getScheduleExecutionsSummary = async (executionId: string): Promise<{
    contents: { total: number };
    notifications: { total: number };
  }> => {
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/schedule-executions/${executionId}/summary`);
    } catch (error) {
      logger.error('getScheduleExecutionsSummary failed:', error);
      throw error;
    }
  };

  getScheduleExecutions = async (query?: AdminQuery): Promise<PaginatedResponse<ScheduleExecution>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/schedule-executions${queryString}`);
    } catch (error) {
      logger.error('getScheduleExecutions failed:', error);
      throw error;
    }
  };

  getScheduleExecution = async (scheduleExecutionId: string): Promise<ScheduleExecution> => {
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/schedule-executions/${scheduleExecutionId}`);
    } catch (error) {
      logger.error('getScheduleExecution failed:', error);
      throw error;
    }
  };

  getScheduleExecutionContent = async (scheduleExecutionId: string, query?: AdminQuery): Promise<PaginatedResponse<Content>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/schedule-executions/${scheduleExecutionId}/content${queryString}`);
    } catch (error) {
      logger.error('getScheduleExecutionContent failed:', error);
      throw error;
    }
  };

  getScheduleExecutionNotifications = async (scheduleExecutionId: string, query?: AdminQuery): Promise<PaginatedResponse<Notification>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/schedule-executions/${scheduleExecutionId}/notifications${queryString}`);
    } catch (error) {
      logger.error('getScheduleExecutionNotifications failed:', error);
      throw error;
    }
  };

  //
  // User Management
  //

  getUserSummary = async (firebaseUid: string): Promise<{
    content: { total: number };
    requests: { total: number };
    authEvents: { total: number };
    notifications: { total: number };
  }> => {
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/users/${firebaseUid}/summary`);
    } catch (error) {
      logger.error('getUserSummary failed:', error);
      throw error;
    }
  };

  getUsers = async (query?: AdminQuery): Promise<PaginatedResponse<UserProfile>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/users${queryString}`);
    } catch (error) {
      logger.error('getUsers failed:', error);
      throw error;
    }
  };

  getUser = async (firebaseUid: string): Promise<UserProfile> => {
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/users/${firebaseUid}`);
    } catch (error) {
      logger.error('getUser failed:', error);
      throw error;
    }
  };

  getUserDevices = async (firebaseUid: string, query?: AdminQuery): Promise<PaginatedResponse<Device>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/users/${firebaseUid}/devices${queryString}`);
    } catch (error) {
      logger.error('getUserDevices failed:', error);
      throw error;
    }
  };

  getUserContent = async (firebaseUid: string, query?: AdminQuery): Promise<PaginatedResponse<Content>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/users/${firebaseUid}/content${queryString}`);
    } catch (error) {
      logger.error('getUserContent failed:', error);
      throw error;
    }
  };

  getUserAuthEvents = async (firebaseUid: string, query?: AdminQuery): Promise<PaginatedResponse<AuthEvent>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/users/${firebaseUid}/auth-events${queryString}`);
    } catch (error) {
      logger.error('getUserAuthEvents failed:', error);
      throw error;
    }
  };

  getUserNotifications = async (firebaseUid: string, query?: AdminQuery): Promise<PaginatedResponse<Notification>> => {
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
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/devices/${deviceId}/summary`);
    } catch (error) {
      logger.error('getDeviceSummary failed:', error);
      throw error;
    }
  };

  getDevices = async (query?: AdminQuery): Promise<PaginatedResponse<Device>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/devices${queryString}`);
    } catch (error) {
      logger.error('getDevices failed:', error);
      throw error;
    }
  };

  getDeviceSession = async (deviceId: string): Promise<DeviceSession> => {
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/device-sessions/${deviceId}`);
    } catch (error) {
      logger.error('getDeviceSession failed:', error);
      throw error;
    }
  };

  getDevice = async (deviceId: string): Promise<Device> => {
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/devices/${deviceId}`);
    } catch (error) {
      logger.error('getDevice failed:', error);
      throw error;
    }
  };

  getDeviceUsers = async (deviceId: string, query?: AdminQuery): Promise<PaginatedResponse<UserProfile>> => {
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/devices/${deviceId}/users${queryString}`);
    } catch (error) {
      logger.error('getDeviceUsers failed:', error);
      throw error;
    }
  };

  getDeviceAuthEvents = async (deviceId: string, query?: AdminQuery): Promise<PaginatedResponse<AuthEvent>> => {
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
    try {
      const queryString = this.buildQueryString(query);
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/auth-events${queryString}`);
    } catch (error) {
      logger.error('getAuthEvents failed:', error);
      throw error;
    }
  };

  getAuthEvent = async (eventId: string): Promise<AuthEvent> => {
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
    try {
      return await this.fetchWithAuth(`${API_BASE_URL}/admin/notifications/${notificationId}`);
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
    try {
      return await this.fetchWithAuth(
        `${API_BASE_URL}/admin/notifications/send/${deviceId}`, 
        "POST",
        {body: JSON.stringify({
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