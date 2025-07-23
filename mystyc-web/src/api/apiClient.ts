import { Content } from 'mystyc-common/schemas/';

import { ContentRequest, RegisterVisitRequest } from '@/interfaces/website-requests.interface';
import { DeviceInfo } from '@/interfaces/device-info.interface';
import { AuthClient } from './AuthClient';
import { UserClient } from './UserClient';
import { logger } from '@/util/logger';

export const serverRoot: string = '/api';
export class ApiError extends Error {
  code: number;
  type: string;
  
  constructor(message: string, code: number, type: string = 'unknown') {
    super(message);
    this.code = code;
    this.type = type;
  }
}

export const getDeviceInfo = (): DeviceInfo => {
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

export const apiClient = {
  auth: new AuthClient(),  
  user: new UserClient(),  

  registerVisit(pathname: string): void {
    const requestBody: RegisterVisitRequest = {
      deviceInfo: getDeviceInfo(),
      pathname,
      clientTimestamp: new Date().toISOString() 
    };

    fetch(`${serverRoot}/register-visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
  },

  async getContent(): Promise<Content> {
    const requestBody: ContentRequest = {
      deviceInfo: getDeviceInfo()
    };

    const response = await fetch(`${serverRoot}/content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || 'getContent failed', response.status, errorData.type);
    }

    return response.json();
  },
};