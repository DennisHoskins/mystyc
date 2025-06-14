import { NextRequest } from 'next/server';
import { Device } from '@/interfaces/device.interface';

export function buildDevice(
  deviceId: string,
  deviceInfo: { 
    timezone: string,
    language: string 
  },
  request: NextRequest
): Device {
  
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
    deviceId,
    deviceName: generateDeviceName(deviceId, userAgent),
    platform: getPlatform(userAgent),
    timezone: deviceInfo.timezone,
    language: deviceInfo.language,
    userAgent
  };
}