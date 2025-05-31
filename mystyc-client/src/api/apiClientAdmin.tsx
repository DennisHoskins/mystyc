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
  
  promoteUser: (token: string, firebaseUid: string) =>
    fetchAdminApi(`/admin/users/${firebaseUid}/promote`, { method: 'POST', token }),
  
  revokeAdmin: (token: string, firebaseUid: string) =>
    fetchAdminApi(`/admin/users/${firebaseUid}/revoke-admin`, { method: 'PATCH', token }),

  // Device Management
  getDevices: (token: string, query?: Record<string, any>) => {
    const params = query ? new URLSearchParams(query).toString() : '';
    return fetchAdminApi(`/admin/devices${params ? `?${params}` : ''}`, { method: 'GET', token });
  },
  
  getUserDevices: (token: string, firebaseUid: string) =>
    fetchAdminApi(`/admin/devices/${firebaseUid}`, { method: 'GET', token }),

  // Auth Events Management
  getAuthEvents: (token: string, query?: Record<string, any>) => {
    const params = query ? new URLSearchParams(query).toString() : '';
    return fetchAdminApi(`/admin/auth-events${params ? `?${params}` : ''}`, { method: 'GET', token });
  },
  
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
};