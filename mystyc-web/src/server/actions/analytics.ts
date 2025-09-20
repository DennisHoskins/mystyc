'use server'

import { headers } from 'next/headers';
import { UAParser } from 'ua-parser-js';
import { DeviceInfo } from '@/interfaces/device-info.interface';
import { logger } from '@/util/logger';
import { sessionManager, InvalidSessionError } from '@/server/services/sessionManager';

import redis from '@/server/util/redisClient';

type VisitSession = {
  sessionId: string | null;
  deviceId: string | null;
  deviceName: string | null;
  firebaseUId: string | null;
  email: string | null;
};

type ParsedUserAgent = {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  deviceType: string;
};

function parseUserAgent(userAgentString: string): ParsedUserAgent {
  const parser = new UAParser(userAgentString);
  const result = parser.getResult();
  
  return {
    browser: result.browser.name || 'Unknown',
    browserVersion: result.browser.version || '',
    os: result.os.name || 'Unknown',
    osVersion: result.os.version || '',
    deviceType: result.device.type || 'desktop'
  };
}

function createDedupeKey(
  visitorId: string, 
  pathname: string, 
  userAgent: string, 
  timestamp: Date
): string {
  const roundedMinute = Math.floor(timestamp.getTime() / (60 * 1000)) * 60 * 1000;
  const userAgentHash = userAgent.slice(0, 20);
  return `analytics:dedupe:${visitorId}:${pathname}:${userAgentHash}:${roundedMinute}`;
}

export async function registerVisit(params: {
  deviceInfo: DeviceInfo;
  pathname: string;
  clientTimestamp: string;
}): Promise<void> {
  logger.log('[registerVisit] begin register visit');
  
  const { deviceInfo, pathname, clientTimestamp } = params;
  logger.log('[registerVisit] DeviceInfo:', deviceInfo);

  const headersList = await headers();
  
  // Try to get session but don't fail if none
  let session;
  try {
    session = await sessionManager.getCurrentSession(headersList, deviceInfo);
  } catch (err) {
    if (!(err instanceof InvalidSessionError)) throw err;
  }

  const user: VisitSession | null = session
    ? {
        sessionId: session.sessionId,
        deviceId: session.deviceId,
        deviceName: session.deviceName,
        firebaseUId: session.uid,
        email: session.email,
      }
    : null;

  const userAgent = headersList.get('user-agent') || '';
  const parsedUA = parseUserAgent(userAgent);
  const serverTimestamp = new Date();
  const clientDate = new Date(clientTimestamp);

  // Deduplication
  const THRESHOLD_SECS = 30 * 60;
  const visitorId = session?.sessionId ?? session?.deviceId ?? 'anon';
  const dedupeKey = createDedupeKey(visitorId, pathname, userAgent, serverTimestamp);
  
  let wasNew: string | null;
  try {
    wasNew = await redis.set(dedupeKey, Date.now(), { NX: true, EX: THRESHOLD_SECS });
  } catch (err) {
    logger.error('[registerVisit] dedupe check failed', err);
    wasNew = 'OK';
  }
  
  if (!wasNew) {
    logger.log('[registerVisit] duplicate visit detected, skipping');
    return; // Just return, no error
  }

  // Build visit payload
  const visit = {
    user,
    path: pathname,
    clientTimestamp,
    serverTimestamp: serverTimestamp.toISOString(),
    ip: headersList.get('x-forwarded-for')?.split(',')[0] ?? '',
    userAgent,
    parsedUA,
    acceptLanguage: headersList.get('accept-language') ?? '',
    cores: deviceInfo.cores,
    renderer: deviceInfo.renderer,
    timezone: deviceInfo.timezone,
    language: deviceInfo.language,
  };

  // Date calculations
  const dateKey = clientDate.toISOString().split('T')[0];
  const hour = serverTimestamp.getHours().toString().padStart(2, '0');
  const dayOfWeek = serverTimestamp.getDay();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[dayOfWeek];
  
  let timezoneHour = hour;
  if (deviceInfo.timezone) {
    try {
      const tzDate = new Date(serverTimestamp.toLocaleString('en-US', { timeZone: deviceInfo.timezone }));
      timezoneHour = tzDate.getHours().toString().padStart(2, '0');
    } catch (err) {
      logger.error('[registerVisit] timezone parsing failed', err);
    }
  }

  // Write analytics
  try {
    const pipeline = redis.multi();
    
    // Raw visit log (keep for debugging/recent analysis)
    pipeline.rPush('analytics:visits', JSON.stringify(visit));
    pipeline.lTrim('analytics:visits', -10000, -1); // Keep last 10k visits only
    
    // Core counters
    pipeline.hIncrBy('analytics:daily_counts', dateKey, 1);
    pipeline.hIncrBy(`analytics:path_counts:${dateKey}`, pathname, 1);
    pipeline.hIncrBy(`analytics:device_counts:${dateKey}`, deviceInfo.renderer, 1);
    pipeline.hIncrBy(`analytics:usertype_counts:${dateKey}`, 
      session ? 'authenticated' : 'visitor', 1
    );
    
    // Time-based counters
    pipeline.hIncrBy(`analytics:hourly_counts:${dateKey}`, hour, 1);
    pipeline.hIncrBy(`analytics:timezone_hourly_counts:${dateKey}`, timezoneHour, 1);
    pipeline.hIncrBy(`analytics:dayofweek_counts:${dateKey}`, dayName, 1);
    
    // Browser and OS counters
    pipeline.hIncrBy(`analytics:browser_counts:${dateKey}`, parsedUA.browser, 1);
    pipeline.hIncrBy(`analytics:os_counts:${dateKey}`, parsedUA.os, 1);
    pipeline.hIncrBy(`analytics:devicetype_counts:${dateKey}`, parsedUA.deviceType, 1);
    
    // High-level browser-device combination
    const simpleCombination = `${parsedUA.browser} ${parsedUA.deviceType}`;
    pipeline.hIncrBy(`analytics:browser_device_counts:${dateKey}`, simpleCombination, 1);

    // Detailed browser-device combinations
    const browserDevice = `${parsedUA.browser}${parsedUA.browserVersion ? ` ${parsedUA.browserVersion.split('.')[0]}` : ''} ${parsedUA.deviceType}`;
    const platformDevice = `${parsedUA.os}${parsedUA.osVersion ? ` ${parsedUA.osVersion.split('.')[0]}` : ''} ${parsedUA.deviceType}`;
    const fullCombination = `${parsedUA.browser} ${parsedUA.os} ${parsedUA.deviceType}`;

    pipeline.hIncrBy(`analytics:browser_device_detailed_counts:${dateKey}`, browserDevice, 1);
    pipeline.hIncrBy(`analytics:platform_device_counts:${dateKey}`, platformDevice, 1);
    pipeline.hIncrBy(`analytics:full_combination_counts:${dateKey}`, fullCombination, 1);
    
    // Timezone counters
    if (deviceInfo.timezone) {
      pipeline.hIncrBy(`analytics:timezone_counts:${dateKey}`, deviceInfo.timezone, 1);
    }
    
    // Language counters
    if (deviceInfo.language) {
      pipeline.hIncrBy(`analytics:language_counts:${dateKey}`, deviceInfo.language, 1);
    }
    
    await pipeline.exec();
    logger.log('[registerVisit] analytics written successfully');
  } catch (err) {
    logger.error('[registerVisit] analytics write failed', err);
  }
}