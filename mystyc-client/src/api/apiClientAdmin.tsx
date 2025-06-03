import { errorHandler } from '@/util/errorHandler';
import { logger } from '@/util/logger';

const API_BASE_URL = 'https://skull.international/api';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ApiOptions {
  method?: HttpMethod;
  body?: any;
  headers?: Record<string, string>;
  token: string;
}

async function fetchAdminApi<T = any>(endpoint: string, options: ApiOptions): Promise<T> {
  const { method = 'GET', body, headers = {}, token } = options;

  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...headers,
    },
  };

  if (body) {
    logger.log('Admin API request body:', JSON.stringify(body, null, 2));
    requestOptions.body = JSON.stringify(body);
  }

  logger.log(`Admin API request: ${method} ${endpoint}`, requestOptions);
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Admin API error: ${response.status}`;
      logger.error('Admin API error response:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {}
      
      const apiError = new Error(errorMessage);
      (apiError as any).status = response.status;
      (apiError as any).response = { status: response.status, data: errorText };
      
      errorHandler.processError(apiError, {
        component: 'adminApiClient',
        action: `${method} ${endpoint}`,
        additional: { status: response.status }
      });
      
      throw apiError;
    }

    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
  } catch (error) {
    errorHandler.processError(error, {
      component: 'adminApiClient',
      action: `${method} ${endpoint}`,
      additional: { 
        isOnline: navigator.onLine,
        url: `${API_BASE_URL}${endpoint}`
      }
    });
    
    throw error;
  }
}

export const apiClientAdmin = {
  // User Management
  getUsers: (token: string) =>
    fetchAdminApi('/admin/users', { method: 'GET', token }),

  getUser: (token: string, firebaseUid: string) =>
    fetchAdminApi(`/admin/user/${firebaseUid}`, { method: 'GET', token }),  
  
  promoteUser: (token: string, firebaseUid: string) =>
    fetchAdminApi(`/admin/user/${firebaseUid}/promote-admin`, { method: 'POST', token }),
  
  revokeAdmin: (token: string, firebaseUid: string) =>
    fetchAdminApi(`/admin/user/${firebaseUid}/revoke-admin`, { method: 'PATCH', token }),

  revokeUserTokens: (token: string, firebaseUid: string) =>
    fetchAdminApi(`/admin/user/${firebaseUid}/revoke-tokens`, { method: 'POST', token }),

  // Device Management
  getDevices: (token: string, query?: Record<string, any>) => {
    const params = query ? new URLSearchParams(query).toString() : '';
    return fetchAdminApi(`/admin/devices${params ? `?${params}` : ''}`, { method: 'GET', token });
  },

  getDevice: (token: string, deviceId: string) =>
    fetchAdminApi(`/admin/device/${deviceId}`, { method: 'GET', token }),
  
  getUserDevices: (token: string, firebaseUid: string) =>
    fetchAdminApi(`/admin/devices/${firebaseUid}`, { method: 'GET', token }),

  // Auth Events Management
  getAuthEvents: (token: string, query?: Record<string, any>) => {
    const params = query ? new URLSearchParams(query).toString() : '';
    return fetchAdminApi(`/admin/auth-events${params ? `?${params}` : ''}`, { method: 'GET', token });
  },

  getAuthEvent: (token: string, eventId: string) =>
    fetchAdminApi(`/admin/auth-event/${eventId}`, { method: 'GET', token }),
  
  getUserAuthEvents: (token: string, firebaseUid: string, limit?: number, offset?: number) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    return fetchAdminApi(`/admin/auth-events/${firebaseUid}${params.toString() ? `?${params}` : ''}`, { method: 'GET', token });
  },

  getDeviceAuthEvents: (token: string, deviceId: string, limit?: number, offset?: number) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    return fetchAdminApi(`/admin/devices/${deviceId}/auth-events${params.toString() ? `?${params}` : ''}`, { method: 'GET', token });
  },

  getAuthEventDevice: (token: string, eventId: string) =>
    fetchAdminApi(`/admin/auth-events/${eventId}/device`, { method: 'GET', token }),

  // Notifications Management
  getNotifications: (token: string, query?: Record<string, any>) => {
    const params = query ? new URLSearchParams(query).toString() : '';
    return fetchAdminApi(`/admin/notifications${params ? `?${params}` : ''}`, { method: 'GET', token });
  },

  getNotification: (token: string, notificationId: string) =>
    fetchAdminApi(`/admin/notification/${notificationId}`, { method: 'GET', token }),

  sendTestNotification: (token: string, fcmToken: string) =>
    fetchAdminApi('/admin/notifications/test', { 
      method: 'POST', 
      body: { token: fcmToken }, 
      token 
    }),

  sendUserNotification: (token: string, firebaseUid: string) =>
    fetchAdminApi('/admin/notifications/send', { 
      method: 'POST', 
      body: { 
        firebaseUid,
        title: 'Admin Notification',
        body: 'You have received a notification from an administrator'
      }, 
      token 
    }),

  sendDeviceNotification: (token: string, deviceId: string) =>
    fetchAdminApi('/admin/notifications/send', { 
      method: 'POST', 
      body: { 
        deviceId,
        title: 'Admin Notification',
        body: 'You have received a notification from an administrator'
      }, 
      token 
    }),
};