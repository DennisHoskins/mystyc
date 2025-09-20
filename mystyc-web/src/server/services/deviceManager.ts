import 'server-only';

import { NextRequest } from 'next/server';

import { Device } from 'mystyc-common/schemas/';
import { DeviceInfo } from '@/interfaces/device-info.interface';

/**
 * Build device object with deterministic ID from fingerprint
 */
export function buildDevice(
  firebaseUid: string,
  deviceInfo: DeviceInfo,
  request: NextRequest
): Device {
  
  // Extract fingerprint and generate deterministic deviceId
  // const fingerprint = extractDeviceFingerprint(request);
  // const deviceId = generateDeviceId(fingerprint, deviceInfo);
  const deviceId = deviceInfo.deviceId;
  
  // Get platform from User-Agent
  const getPlatform = (userAgent: string): string => {
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('android')) return 'android';
    if (ua.includes('iphone') || ua.includes('ipad')) return 'ios';
    if (ua.includes('mac')) return 'macos';
    if (ua.includes('windows')) return 'windows';
    if (ua.includes('linux')) return 'linux';
    
    return 'web';
  };

  // Get app version from User-Agent
  const getAppVersion = (userAgent: string): string => {
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      const chromeMatch = userAgent.match(/Chrome\/(\d+\.\d+\.\d+)/);
      return chromeMatch ? chromeMatch[1] : '0.0.0';
    } else if (userAgent.includes('Firefox')) {
      const firefoxMatch = userAgent.match(/Firefox\/(\d+\.\d+)/);
      return firefoxMatch ? `${firefoxMatch[1]}.0` : '0.0.0';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      const safariMatch = userAgent.match(/Version\/(\d+\.\d+\.\d+)/);
      return safariMatch ? safariMatch[1] : '0.0.0';
    } else if (userAgent.includes('Edg')) {
      const edgeMatch = userAgent.match(/Edg\/(\d+\.\d+\.\d+)/);
      return edgeMatch ? edgeMatch[1] : '0.0.0';
    }
    
    return '0.0.0';
  };

  // Generate device name
  const generateDeviceName = (deviceId: string, userAgent: string): string => {
    const deviceSuffix = deviceId.slice(0, 8);
    const platform = getPlatform(userAgent);
    
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
        return userAgent.includes('iPad') 
          ? `iPad ${browser} (${deviceSuffix})` 
          : `iPhone ${browser} (${deviceSuffix})`;
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

  const userAgent = request.headers.get('user-agent') || 'unknown';

  return {
    firebaseUid,
    deviceId,
    deviceName: generateDeviceName(deviceId, userAgent),
    platform: getPlatform(userAgent),
    appVersion: getAppVersion(userAgent),
    timezone: deviceInfo.timezone,
    language: deviceInfo.language,
    userAgent
  };
}