import { errorHandler } from '@/util/errorHandler';
import { logger } from '@/util/logger';

import { User } from '@/interfaces/user.interface';
import { Device } from '@/interfaces/device.interface';
import { AuthEvent } from '@/interfaces/authEvent.interface';
import { RegisterSession } from '@/interfaces/registerSession.interface';

const API_BASE_URL = 'https://skull.international/api';
//const API_BASE_URL = 'http://localhost:3001/api';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ApiOptions {
  method?: HttpMethod;
  body?: any;
  headers?: Record<string, string>;
  token?: string;
}

interface UpdateUserProfileData {
  fullName?: string;
  dateOfBirth?: string;
  zodiacSign?: string;
}

export async function fetchApi<T = any>(
  endpoint: string,
  options: ApiOptions
): Promise<T> {
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
    idToken: string,
    dto: RegisterSession
  ): Promise<User> =>
    fetchApi<User>('/users/me', {
      method: 'POST',
      token: idToken,
      body: dto,
    }),

 updateFcmToken: (
    idToken: string,
    deviceId: string,
    fcmToken: string
  ): Promise<void> =>
    fetchApi<void>('/devices/notify-token', {
      method: 'POST',
      token: idToken,
      body: { deviceId, fcmToken },
    }),    

getCurrentUser: (idToken: string): Promise<User> =>
    fetchApi<User>('/users/me', {
      method: 'GET',
      token: idToken,
    }),

  getCurrentUserWithDevice: (
    idToken: string,
    deviceData: Device,
    authEventData: AuthEvent
  ): Promise<User> =>
    fetchApi<User>('/users/me', {
      method: 'POST',
      token: idToken,
      body: { device: deviceData, authEvent: authEventData },
    }),    

  logout: (
    idToken: string,
    dto: RegisterSession
  ): Promise<void> =>
    fetchApi<void>('/users/logout', {
      method: 'POST',
      token: idToken,
      body: dto,
    }),

  updateUserProfile: (
    idToken: string,
    data: UpdateUserProfileData
  ): Promise<User> =>
    fetchApi<User>('/users/update-profile', {
      method: 'PATCH',
      token: idToken,
      body: data,
    }),    
};
