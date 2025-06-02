import { useState, useEffect, useCallback } from 'react';
import { Device } from '@/interfaces/device.interface';
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
  const [deviceData, setDeviceData] = useState<Device | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Create device data when we have a firebaseUid
  const createDeviceData = useCallback((firebaseUid: string): Device => {
    if (typeof window === 'undefined') {
      throw new Error('Device info can only be created in browser environment');
    }

    try {
      const data: Device = {
        firebaseUid,
        deviceId: getOrCreateDeviceId(),
        platform: getPlatform(),
        timezone: getTimezone(),
        language: getLanguage(),
        userAgent: getUserAgent(),
      };

      logger.log('[useDeviceInfo] Device data created for user:', firebaseUid, data);
      return data;
    } catch (err) {
      logger.error('[useDeviceInfo] Failed to create device data:', err);
      throw err;
    }
  }, []);

  // Initialize device data when firebaseUid is provided
  const initializeDeviceData = useCallback((firebaseUid: string) => {
    try {
      const data = createDeviceData(firebaseUid);
      setDeviceData(data);
      setIsLoading(false);
      logger.log('[useDeviceInfo] Device data initialized:', data);
    } catch (err) {
      logger.error('[useDeviceInfo] Failed to initialize device data:', err);
      setDeviceData(null);
      setIsLoading(false);
    }
  }, [createDeviceData]);

  // Clear device data (for logout)
  const clearDeviceData = useCallback(() => {

    console.log("wtfers", deviceData)
    
    setDeviceData(null);
    setIsLoading(true);
    logger.log('[useDeviceInfo] Device data cleared');
  }, [deviceData]);

  // Regenerate device ID (for server conflict handling)
  const regenerateDeviceId = useCallback((): string => {
    if (typeof window === 'undefined') return generateDeviceId();

    // Remove old device ID
    storage.local.removeItem(DEVICE_ID_KEY);
    
    // Generate new one
    const newId = generateDeviceId();
    storage.local.setItem(DEVICE_ID_KEY, newId);
    
    // Update current device data if it exists
    setDeviceData(prev => prev ? { ...prev, deviceId: newId } : null);
    
    logger.log('[useDeviceInfo] Regenerated device ID due to server conflict:', newId);
    return newId;
  }, []);

  // Get current device ID from localStorage
  const getCurrentDeviceId = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    
    return storage.local.getItem(DEVICE_ID_KEY) || deviceData?.deviceId || null;
  }, [deviceData?.deviceId]);

  // Set loading to false initially since we don't auto-initialize
  useEffect(() => {
    setIsLoading(false);
  }, []);

  return {
    deviceData,
    isLoading,
    initializeDeviceData,
    clearDeviceData,
    createDeviceData,
    regenerateDeviceId,
    getCurrentDeviceId,
  };
}