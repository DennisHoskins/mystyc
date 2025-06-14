import { User } from '@/interfaces/user.interface';
import { logger } from '@/util/logger'

const serverRoot: string = '/api/auth';

const getDeviceInfo = () => {
  const getTimezone = (): string => {
    if (typeof window === 'undefined') return 'UTC';
    
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (err) {
      logger.info("Setting TimeZone to default (UTC)", err);
      return 'UTC';
    }
  };

  const getLanguage = (): string => {
    if (typeof window === 'undefined') return 'en';
    
    try {
      return navigator.language || 'en';
    } catch (err) {
      logger.info("Setting Language to default (en)", err);
      return 'en';
    }
  };

  return {
    timezone: getTimezone(),
    language: getLanguage()
  };
};

class ApiError extends Error {
  code: number;
  type: string;
  
  constructor(message: string, code: number, type: string = 'unknown') {
    super(message);
    this.code = code;
    this.type = type;
  }
}

export const apiClient = {

  async register(email: string, password: string): Promise<User> {

    const response = await fetch(`${serverRoot}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email, 
        password, 
        deviceInfo: getDeviceInfo(),
        clientTimestamp: new Date().toISOString() 
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || 'Registration failed', response.status, errorData.type);
    }

    return response.json();
  },

  async signIn(email: string, password: string): Promise<User> {
    const response = await fetch(`${serverRoot}/login`, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email, 
        password, 
        deviceInfo: getDeviceInfo(),
        clientTimestamp: new Date().toISOString() 
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || 'Sign In failed', response.status, errorData.type);
    }

    return response.json();
  },

  async resetPassword(email: string): Promise<void> {
    const response = await fetch(`${serverRoot}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || 'Password Reset failed', response.status, errorData.type);
    }
  },

  async signOut(): Promise<void> {
    const response = await fetch(`${serverRoot}/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        clientTimestamp: new Date().toISOString() 
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || 'Logout failed', response.status, errorData.type);
    }
  }
};