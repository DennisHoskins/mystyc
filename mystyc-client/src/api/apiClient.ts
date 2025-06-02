import { parseApiDate } from '@/util/dateTime';
import { errorHandler } from '@/util/errorHandler';
import { AuthEvent, Device } from '@/interfaces';
import { storage } from '@/util/storage';
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
      let errorCode: string | undefined;
      
      logger.error('Server error response:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
        errorCode = errorData.code;
      } catch {}
      
      // Handle revoked tokens specifically
      if (response.status === 401 && errorCode === 'TOKEN_REVOKED') {
        logger.error('[apiClient] Token revoked by server - forcing logout');
        
        // Clear all auth state immediately
        storage.session.removeItem('mystyc_user');
        storage.session.removeItem('onboardingIntroShown');
        
        // Clear any cached user data
        const cacheKeys = storage.session.getItem('mystyc_cache_keys');
        if (cacheKeys) {
          try {
            const keys = JSON.parse(cacheKeys);
            keys.forEach((key: string) => storage.session.removeItem(key));
            storage.session.removeItem('mystyc_cache_keys');
          } catch {}
        }
        
        // Force redirect to server logout page
        window.location.href = '/server-logout';
        throw new Error('TOKEN_REVOKED'); // Throw to exit function properly
      }
      
      const apiError = new Error(errorMessage);
      (apiError as any).status = response.status;
      (apiError as any).response = { status: response.status, data: errorText };
      
      // Add error code if available
      if (errorCode) {
        (apiError as any).response.data = { code: errorCode, message: errorMessage };
      }
      
      errorHandler.processError(apiError, {
        component: 'apiClient',
        action: `${method} ${endpoint}`,
        additional: { status: response.status, errorCode }
      });
      
      throw apiError;
    }

    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
  } catch (error) {
    // Skip normal error handling if we already redirected for revoked token
    if (typeof window !== 'undefined' && window.location.pathname === '/server-logout') {
      return {} as T;
    }
    
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
  
  getCurrentUserWithDevice: (token: string, deviceData: Device, authEventData: AuthEvent) =>
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