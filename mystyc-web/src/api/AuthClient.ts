import { User } from 'mystyc-common/schemas/';
import { AuthLoginRequest, AuthRegisterRequest, AuthLogoutRequest, AuthResetPasswordRequest } from '@/interfaces/auth-requests.interface';
import { serverRoot, getDeviceInfo, ApiError } from './apiClient';

export class AuthClient {
  async register(email: string, password: string): Promise<User> {
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
  }

  async signIn(email: string, password: string): Promise<User> {
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
  }

  async resetPassword(email: string): Promise<void> {
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
  }

  async signOut(): Promise<void> {
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
  }

  async serverLogout(): Promise<void> {
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
  }
}