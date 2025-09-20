import { useCallback } from 'react';

import { User } from 'mystyc-common/schemas/';
import {
  AuthLoginRequest,
  AuthRegisterRequest,
  AuthLogoutRequest,
  AuthResetPasswordRequest
} from '@/interfaces/auth-requests.interface';
import { getDeviceInfo } from '@/util/getDeviceInfo';

class ApiError extends Error {
  code: number;
  type: string;

  constructor(message: string, code: number, type: string = 'unknown') {
    super(message);
    this.code = code;
    this.type = type;
  }
}

export const useAuth = () => {
  const serverRoot: string = '/api';

  const register = useCallback(async (email: string, password: string): Promise<User> => {
    const requestBody: AuthRegisterRequest = {
      email,
      password,
      deviceInfo: getDeviceInfo(),
      clientTimestamp: new Date().toISOString()
    };

    const response = await fetch(`${serverRoot}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || 'Registration failed', response.status, errorData.type);
    }

    return response.json();
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<User> => {
    const requestBody: AuthLoginRequest = {
      email,
      password,
      deviceInfo: getDeviceInfo(),
      clientTimestamp: new Date().toISOString()
    };

    const response = await fetch(`${serverRoot}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || 'Sign In failed', response.status, errorData.type);
    }

    return response.json();
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<void> => {
    const requestBody: AuthResetPasswordRequest = { email };

    const response = await fetch(`${serverRoot}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || 'Password Reset failed', response.status, errorData.type);
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    const requestBody: AuthLogoutRequest = {
      deviceInfo: getDeviceInfo(),
      clientTimestamp: new Date().toISOString()
    };

    const response = await fetch(`${serverRoot}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || 'Logout failed', response.status, errorData.type);
    }
  }, []);

  const serverLogout = useCallback(async (): Promise<void> => {
    const requestBody: AuthLogoutRequest = {
      deviceInfo: getDeviceInfo(),
      clientTimestamp: new Date().toISOString()
    };

    const response = await fetch(`${serverRoot}/auth/server-logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || 'Server Logout failed', response.status, errorData.type);
    }
  }, []);

  return {
    register,
    signIn,
    resetPassword,
    signOut,
    serverLogout
  };
};
