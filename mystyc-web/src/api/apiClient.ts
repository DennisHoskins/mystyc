import { User } from '@/interfaces/user.interface';
import { Device } from '@/interfaces/device.interface';
import { Content } from '@/interfaces/content.interface';
import { logger } from '@/util/logger'

const serverRoot: string = '/api';

export const getDeviceInfo = () => {
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

  const getHardwareCores = (): number => {
    if (typeof window === 'undefined') return 0;
    try {
      return navigator.hardwareConcurrency || 0;
    } catch (err) {
      logger.info("Unable to get Hardware Cores", err);
      return 0;
    }
  };

  const getWebGLRenderer = (): string => {
    if (typeof window === 'undefined') return 'unknown';
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return 'no-webgl';
      
      const webgl = gl as WebGLRenderingContext;
      const debugInfo = webgl.getExtension('WEBGL_debug_renderer_info');
      return debugInfo ? webgl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'masked';
    } catch (err) {
      logger.info("Unable to get WebGL Renderer", err);
      return 'error';
    }
  };

  return {
    cores: getHardwareCores(),
    renderer: getWebGLRenderer(),
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
  registerVisit(pathname: string) {
    fetch(`${serverRoot}/register-visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        deviceInfo: getDeviceInfo(),
        pathname,
        clientTimestamp: new Date().toISOString() 
      })
    });
  },

  async getContent(): Promise<Content> {
    const response = await fetch(`${serverRoot}/content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        deviceInfo: getDeviceInfo(),
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || 'getContent failed', response.status, errorData.type);
    }

    return response.json();
  },

  async register(email: string, password: string): Promise<User> {
    const response = await fetch(`${serverRoot}/auth/register`, {
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
    const response = await fetch(`${serverRoot}/auth/login`, {
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
    const response = await fetch(`${serverRoot}/auth/reset-password`, {
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
    const response = await fetch(`${serverRoot}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        deviceInfo: getDeviceInfo(),
        clientTimestamp: new Date().toISOString() 
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || 'Logout failed', response.status, errorData.type);
    }
  },

  async serverLogout(): Promise<void> {
    const response = await fetch(`${serverRoot}/auth/server-logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        deviceInfo: getDeviceInfo(),
        clientTimestamp: new Date().toISOString() 
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || 'Server Logout failed', response.status, errorData.type);
    }
  },

  async getUser(): Promise<User | null> {
    try {
      const response = await fetch(`${serverRoot}/mystyc/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceInfo: getDeviceInfo() })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data?.error === 'InvalidSession') {
        throw new Error('InvalidSession');
      }
      
      return data;
    } catch (err) {
      throw err;
    }
  },

  async getUserContent(): Promise<Content | null> {
    try {
      const response = await fetch(`${serverRoot}/mystyc/users/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceInfo: getDeviceInfo() })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data?.error === 'InvalidSession') {
        throw new Error('InvalidSession');
      }
      
      return data;
    } catch (err) {
      throw err;
    }
  },

  async updateFcmToken(deviceId: string, fcmToken: string): Promise<Device> {
    try {
      const response = await fetch(`${serverRoot}/mystyc/devices/[${deviceId}]/updateFcmToken`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          deviceInfo: getDeviceInfo(),
          fcmToken
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data?.error === 'InvalidSession') {
        throw new Error('InvalidSession');
      }
      
      return data;
    } catch (err) {
      throw err;
    }
  },

  async startSubscription(priceId: string): Promise<{sessionUrl: string}> {
    try {
      const response = await fetch(`${serverRoot}/mystyc/users/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceInfo: getDeviceInfo(),
          priceId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      throw err;
    }
  },

  async getCustomerBillingPortal(): Promise<{ portalUrl: string }> {
    try {
      const response = await fetch(`${serverRoot}/mystyc/users/billing-portal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceInfo: getDeviceInfo(),
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      throw err;
    }
  },

  async cancelSubscription(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${serverRoot}/mystyc/users/cancel-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceInfo: getDeviceInfo(),
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      throw err;
    }
  }
};