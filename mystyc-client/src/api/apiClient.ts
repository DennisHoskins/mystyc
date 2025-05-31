import { parseApiDate } from '@/util/dateTime';
import { errorHandler } from '@/util/errorHandler';
import { AuthEventData, DeviceData } from '@/interfaces';
import { logger } from '@/util/logger';

const API_BASE_URL = 'https://skull.international/api';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ApiOptions {
  method?: HttpMethod;
  body?: any;
  headers?: Record<string, string>;
  token?: string | null;
}

let triggerConnectionError: (() => void) | null = null;

export const setConnectionErrorHandler = (handler: () => void) => {
  triggerConnectionError = handler;
};

async function fetchApi<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, token } = options;

  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  if (body) {
    logger.log('Full request body:', JSON.stringify(body, null, 2));
    requestOptions.body = JSON.stringify(body);
  }

  logger.log(`API request: ${method} ${endpoint}`, requestOptions);
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API error: ${response.status}`;
      logger.error('Server error response:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {}
      
      const apiError = new Error(errorMessage);
      (apiError as any).status = response.status;
      (apiError as any).response = { status: response.status, data: errorText };
      
      errorHandler.processError(apiError, {
        component: 'apiClient',
        action: `${method} ${endpoint}`,
        additional: { status: response.status }
      });
      
      throw apiError;
    }

    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
  } catch (error) {
    if (!navigator.onLine && triggerConnectionError) {
      triggerConnectionError();
    }
    
    errorHandler.processError(error, {
      component: 'apiClient',
      action: `${method} ${endpoint}`,
      additional: { 
        isOnline: navigator.onLine,
        url: `${API_BASE_URL}${endpoint}`
      }
    });
    
    throw error;
  }
}

function transformUserResponse(userData: any) {
  if (userData?.userProfile?.dateOfBirth) {
    userData.userProfile.dateOfBirth = parseApiDate(userData.userProfile.dateOfBirth);
  }
  if (userData?.userProfile?.createdAt) {
    userData.userProfile.createdAt = parseApiDate(userData.userProfile.createdAt);
  }
  if (userData?.userProfile?.updatedAt) {
    userData.userProfile.updatedAt = parseApiDate(userData.userProfile.updatedAt);
  }
  return userData;
}

export const apiClient = {
  getCurrentUser: (token: string) => 
    fetchApi('/users/me', { method: 'GET', token }).then(transformUserResponse),
  
  getCurrentUserWithDevice: (token: string, deviceData: DeviceData, authEventData: AuthEventData) =>
    fetchApi('/users/me', { 
      method: 'POST', 
      body: { device: deviceData, authEvent: authEventData }, 
      token 
    }).then(transformUserResponse),
  
  updateFcmToken: (token: string, deviceId: string, fcmToken: string) =>
    fetchApi('/devices/notify-token', {
      method: 'POST',
      body: { deviceId, fcmToken },
      token
    }),
  
  updateUserProfile: (token: string, data: any) => 
    fetchApi('/users/update-profile', { method: 'PATCH', body: data, token }).then(transformUserResponse),
};