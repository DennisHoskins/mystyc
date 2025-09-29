import { DeviceInfo } from '@/interfaces/device-info.interface';
import { logger } from '@/util/logger';

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

  const getDeviceId = (): string => {
    if (typeof window === 'undefined') return 'server-generated';
    
    try {
      const stored = localStorage.getItem('device-id');
      if (stored) return stored;
      
      const newId = crypto.randomUUID();
      localStorage.setItem('device-id', newId);
      return newId;
    } catch (err) {
      logger.info("Unable to get/set device ID", err);
      return 'localStorage-error';
    }
  };

  return {
    deviceId: getDeviceId(),
    cores: getHardwareCores(),
    renderer: getWebGLRenderer(),
    timezone: getTimezone(),
    language: getLanguage()
  };
};