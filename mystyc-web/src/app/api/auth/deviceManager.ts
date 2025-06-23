import { NextRequest } from 'next/server';
import { createHash } from 'crypto';
import { Device } from '@/interfaces/device.interface';
import { generateDeviceId } from '../keyManager';

/**
 * Extract device fingerprint from request headers and TLS data
 */
export function extractDeviceFingerprint(request: NextRequest | Headers): string {
  // Normalize to always work with Headers object
  const headers = request instanceof Headers 
    ? request 
    : (request as NextRequest).headers;

  // Check for TLS fingerprint from Apache (production)
  const tlsFingerprint = headers.get('x-tls-fingerprint');

  if (tlsFingerprint) {
    // Production: Use TLS fingerprint from Apache
    return tlsFingerprint;
  }

  // Development: Use UA-based fingerprint with dev- prefix
  const userAgent = headers.get('user-agent') || 'unknown';
  const acceptLanguage = headers.get('accept-language') || '';
  const acceptEncoding = headers.get('accept-encoding') || '';
  const normalizedUA = normalizeUserAgent(userAgent);

  const fingerprint = [
    normalizedUA,
    acceptLanguage,
    acceptEncoding,
  ].join('|');

  // Hash it to get consistent length
  const hash = createHash('sha256');
  hash.update(fingerprint);
  const hashedFingerprint = hash.digest('hex');

  return 'dev-' + hashedFingerprint;
}

/**
 * Normalize User-Agent to focus on stable characteristics
 */
function normalizeUserAgent(userAgent: string): string {
  // Strip version numbers but keep major browser and OS info
  return userAgent
    .replace(/\d+\.\d+\.\d+(\.\d+)?/g, 'X') // Replace version numbers with X
    .replace(/Chrome\/X/g, 'Chrome')
    .replace(/Firefox\/X/g, 'Firefox')
    .replace(/Safari\/X/g, 'Safari')
    .replace(/Edge\/X/g, 'Edge');
}

/**
 * Build device object with deterministic ID from fingerprint
 */
export function buildDevice(
  deviceInfo: { 
    timezone: string,
    language: string 
  },
  request: NextRequest
): Device {
  
  // Extract fingerprint and generate deterministic deviceId
  const fingerprint = extractDeviceFingerprint(request);
  const deviceId = generateDeviceId(fingerprint);
  
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