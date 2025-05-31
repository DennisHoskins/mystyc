import { useState, useEffect, useCallback } from 'react';
import { DeviceData } from '@/interfaces/deviceData.interface';
import { storage } from '@/util/storage';
import { logger } from '@/util/logger';

const DEVICE_ID_KEY = 'mystyc_device_id';

// Generate UUID v4 with crypto.randomUUID() fallback
const generateDeviceId = (): string => {
  // Try modern crypto.randomUUID() first
  if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.randomUUID === 'function') {
    try {
      return window.crypto.randomUUID();
    } catch (err) {
      logger.warn('[useDeviceInfo] crypto.randomUUID() failed, using fallback:', err);
    }
  }

  // Fallback: Generate UUID v4 manually
  const timestamp = Date.now();
  const random = Math.random();
  
  // Create a basic UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (timestamp + random * 16) % 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });

  logger.log('[useDeviceInfo] Generated fallback device ID:', uuid);
  return uuid;
};

// Get short platform name (server lib will parse userAgent separately)
const getPlatform = (): string => {
  if (typeof window === 'undefined') return 'unknown';
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('android')) return 'android';
  if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'ios';
  if (userAgent.includes('mac')) return 'macos';
  if (userAgent.includes('win')) return 'windows';
  if (userAgent.includes('linux')) return 'linux';
  
  return 'web';
};

// Get full user agent for server parsing
const getUserAgent = (): string => {
  if (typeof window === 'undefined') return 'unknown';
  
  try {
    return navigator.userAgent;
  } catch (err) {
    logger.warn('[useDeviceInfo] Failed to get user agent:', err);
    return 'unknown';
  }
};

// Get user's timezone
const getTimezone = (): string => {
  if (typeof window === 'undefined') return 'UTC';
  
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (err) {
    logger.warn('[useDeviceInfo] Failed to get timezone:', err);
    return 'UTC';
  }
};

// Get user's language
const getLanguage = (): string => {
  if (typeof window === 'undefined') return 'en';
  
  try {
    return navigator.language || 'en';
  } catch (err) {
    logger.warn('[useDeviceInfo] Failed to get language:', err);
    return 'en';
  }
};

// Get device ID from localStorage or generate new one
const getOrCreateDeviceId = (): string => {
  if (typeof window === 'undefined') return generateDeviceId();
  
  const storedId = storage.local.getItem(DEVICE_ID_KEY);
  if (storedId && storedId.length > 0) {
    logger.log('[useDeviceInfo] Using stored device ID');
    return storedId;
  }
  
  // Generate new device ID
  const newId = generateDeviceId();
  storage.local.setItem(DEVICE_ID_KEY, newId);
  logger.log('[useDeviceInfo] Generated and stored new device ID');
  
  return newId;
};

export function useDeviceInfo() {
  const [deviceData, setDeviceData] = useState<DeviceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize device data
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const data: DeviceData = {
        deviceId: getOrCreateDeviceId(),
        platform: getPlatform(),
        timezone: getTimezone(),
        language: getLanguage(),
        userAgent: getUserAgent(),
      };

      setDeviceData(data);
      logger.log('[useDeviceInfo] Device data initialized:', data);
    } catch (err) {
      logger.error('[useDeviceInfo] Failed to initialize device data:', err);
      
      // Fallback device data
      const fallbackData: DeviceData = {
        deviceId: generateDeviceId(),
        platform: 'unknown',
        timezone: 'UTC',
        language: 'en',
        userAgent: 'unknown',
      };

      setDeviceData(fallbackData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Regenerate device ID (for server conflict handling)
  const regenerateDeviceId = useCallback((): string => {
    if (typeof window === 'undefined') return generateDeviceId();

    // Remove old device ID
    storage.local.removeItem(DEVICE_ID_KEY);
    
    // Generate new one
    const newId = generateDeviceId();
    storage.local.setItem(DEVICE_ID_KEY, newId);
    
    // Update current device data
    setDeviceData(prev => prev ? { ...prev, deviceId: newId } : null);
    
    logger.log('[useDeviceInfo] Regenerated device ID due to server conflict:', newId);
    return newId;
  }, []);

  // Get current device ID from localStorage
  const getCurrentDeviceId = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    
    return storage.local.getItem(DEVICE_ID_KEY) || deviceData?.deviceId || null;
  }, [deviceData?.deviceId]);

  return {
    deviceData,
    isLoading,
    regenerateDeviceId,
    getCurrentDeviceId,
  };
}