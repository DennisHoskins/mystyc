import { errorHandler } from '@/util/errorHandler';
import { logger } from '@/util/logger';

import { AuthEventLoginRegister, AuthEventLogout, User, UpdateFcmToken } from '@/interfaces';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ApiOptions {
  authToken?: string;
  method?: HttpMethod;
  body?: any;
  headers?: Record<string, string>;
}

interface UpdateUserProfileData {
  fullName?: string;
  dateOfBirth?: string;
  zodiacSign?: string;
}

export async function fetchApi<T = any>(
  authToken: string,
  endpoint: string,
  options: ApiOptions
): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;
  
  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
  };

  if (body) {
    logger.log('API request body:', JSON.stringify(body, null, 2));
    requestOptions.body = JSON.stringify(body);
  }

  logger.log(`API request: ${method} ${endpoint}`, requestOptions);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API error: ${response.status}`;
      logger.error('API error response:', errorText);

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
        additional: { status: response.status },
      });

      throw apiError;
    }

    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
  } catch (error) {
    errorHandler.processError(error as Error, {
      component: 'apiClient',
      action: `${method} ${endpoint}`,
      additional: {
        isOnline: navigator.onLine,
        url: `${API_BASE_URL}${endpoint}`,
      },
    });
    throw error;
  }
};

export const apiClient = {
  registerSession: (
    authToken: string,
    dto: AuthEventLoginRegister
  ): Promise<User> =>
    fetchApi<User>(
      authToken,
      '/users/me', 
      {
        method: 'POST',
        body: dto,
      }
    ),    

 updateFcmToken: (
    authToken: string,
    dto: UpdateFcmToken
  ): Promise<void> =>
    fetchApi<void>(
      authToken,
      '/devices/notify-token', {
      method: 'POST',
      body: dto,
    }),    

  getCurrentUser: (
    authToken: string,
  ): Promise<User> =>
    fetchApi<User>(
      authToken,
      '/users/me', {
      method: 'GET',
    }),

  logout: (
    authToken: string,
    dto: AuthEventLogout
  ): Promise<void> =>
    fetchApi<void>(
      authToken,
      '/users/logout', {
      method: 'POST',
      body: dto,
    }),

  updateUserProfile: (
    authToken: string,
    dto: UpdateUserProfileData
  ): Promise<User> =>
    fetchApi<User>(
      authToken,
      '/users/update-profile', {
      method: 'PATCH',
      body: dto,
    }),    
};
