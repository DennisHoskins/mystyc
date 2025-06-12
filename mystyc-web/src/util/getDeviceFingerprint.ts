import { Device } from '@/interfaces/device.interface';
import { logger } from '@/util/logger';

export default function getDevice(firebaseUid: string, deviceId: string): Device {

  // Get short platform name
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

  // Get user's timezone
  const getTimezone = (): string => {
    if (typeof window === 'undefined') return 'UTC';
    
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (err) {
      logger.log("[deviceFingerprint] Unable to get TimeZone", err);
      return 'UTC';
    }
  };

  // Get user's language
  const getLanguage = (): string => {
    if (typeof window === 'undefined') return 'en';
    
    try {
      return navigator.language || 'en';
    } catch (err) {
      logger.log("[deviceFingerprint] Unable to get Language", err);
      return 'en';
    }
  };

  // Get full user agent
  const getUserAgent = (): string => {
    if (typeof window === 'undefined') return 'unknown';
    
    try {
      return navigator.userAgent;
    } catch (err) {
      logger.log("[deviceFingerprint] Unable to get User Agent", err);
      return 'unknown';
    }
  }

const getName = (): string => {
  // Get first 8 chars of deviceId for uniqueness
  const deviceSuffix = deviceId.slice(0, 8);

  if (typeof window === 'undefined') return `Unknown Device (${deviceSuffix})`;

  const platform = getPlatform();
  const userAgent = navigator.userAgent;

  // Browser detection
  let browser = 'Browser';
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
  else if (userAgent.includes('Edg')) browser = 'Edge';
 
  // Platform-specific naming
  switch (platform) {
    case 'android':
      return `Android ${browser} (${deviceSuffix})`;
    case 'ios':
      return userAgent.includes('iPad') ? `iPad ${browser} (${deviceSuffix})` : `iPhone ${browser} (${deviceSuffix})`;
    case 'macos':
      return `Mac ${browser} (${deviceSuffix})`;
    case 'windows':
      return `Windows ${browser} (${deviceSuffix})`;
    case 'linux':
      return `Linux ${browser} (${deviceSuffix})`;
    default:
      return `${browser} Device (${deviceSuffix})`;
    }
  };

  return {
    firebaseUid,
    deviceId,
    deviceName: getName(),
    platform: getPlatform(),
    timezone: getTimezone(), 
    language: getLanguage(),
    userAgent: getUserAgent()
  };

}