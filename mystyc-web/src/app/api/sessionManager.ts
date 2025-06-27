import { createClient } from 'redis';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { extractDeviceFingerprint } from './auth/deviceManager';
import { 
  getSessionCookieName, 
  encryptCookieValue, 
  decryptCookieValue,
  validateSessionId,
  generateDeviceId 
} from './keyManager';

import { Session } from '@/interfaces/session.interface';
import { logger } from '@/util/logger';

import { IdTokens } from './authTokenManager';

// custom error for any tampered / out-of-sync session
export class InvalidSessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSessionError';
  }
}

// Create Redis client
const redis = createClient({
  url: process.env.REDIS_URL
});

// Connect to Redis (only connect once)
let isConnected = false;
async function ensureConnection() {
  if (!isConnected && !redis.isOpen) {
    await redis.connect();
    isConnected = true;
    logger.log('[sessionManager] Redis connected');
  }
} 

export const sessionManager = {

  async createSession(
    uid: string,
    deviceId: string, 
    idTokens: IdTokens,
    sessionId: string,
    email: string,
    deviceName: string,
    isAdmin: boolean = false    
  ): Promise<string> {
    await ensureConnection();

    // Check for existing session on this device
    const existingSessionId = await this.getDeviceSession(deviceId);
    if (existingSessionId && existingSessionId !== sessionId) {
      logger.log('[sessionManager] Device already has session, clearing:', deviceId.substring(0, 8));
      await this.clearSessionByDeviceId(deviceId);
    }

    logger.log('[sessionManager] Creating session for uid:', uid, 'device:', deviceId.substring(0, 8));

    // Store session data (existing code)
    const authTokenKey = `mystyc::${sessionId}::${deviceId}::${uid}::tokenAuth`;
    await redis.set(authTokenKey, idTokens.authToken);
    
    const refreshTokenKey = `mystyc::${sessionId}::${deviceId}::${uid}::tokenRefresh`;
    await redis.set(refreshTokenKey, idTokens.refreshToken);

    const metadataKey = `mystyc::${sessionId}::${deviceId}::${uid}::metadata`;
    await redis.hSet(metadataKey, {
      email,
      deviceName,
      isAdmin: isAdmin.toString(),
      createdAt: Date.now().toString()
    });

    // Create device mapping
    await this.setDeviceSession(deviceId, sessionId);

    // Set cookie (existing code)
    const cookieStore = await cookies();
    cookieStore.set(getSessionCookieName(), encryptCookieValue(sessionId), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    logger.log('[sessionManager] Session created with device mapping');
    return sessionId;
  },

  async setDeviceSession(deviceId: string, sessionId: string): Promise<void> {
    await ensureConnection();
    await redis.set(`mystyc_device_session::${deviceId}`, sessionId);
    logger.log('[sessionManager] Device session mapping created:', deviceId.substring(0, 8));
  },

  async getCurrentSession(request?: NextRequest | Headers): Promise<Session | null> {
    await ensureConnection();

    logger.log('');
    logger.log('[sessionManager] Getting current session');

    // Calculate deviceId from request
    if (!request) {
      logger.error('[sessionManager] No request provided for device calculation');
      return null;
    }

    const fingerprint = extractDeviceFingerprint(request);
    const deviceId = generateDeviceId(fingerprint);
    logger.log('[sessionManager] Calculated device ID:', deviceId.substring(0, 8));

    const cookieStore = await cookies();
    const encryptedSessionId = cookieStore.get(getSessionCookieName())?.value;

    if (!encryptedSessionId) {
      logger.log('[sessionManager] No session cookie found');
      return null;
    }

    // Decrypt the session cookie value
    const sessionId = decryptCookieValue(encryptedSessionId);

    if (!sessionId) {
      logger.error('[sessionManager] Failed to decrypt session cookie');
      throw new InvalidSessionError('cookie decryption failed');
    }

    logger.log('[sessionManager] Session ID:', sessionId.substring(0, 8), 'Device ID:', deviceId.substring(0, 8));

    // Get the auth token for this session with calculated deviceId
    const patternAuth = `mystyc::${sessionId}::${deviceId}::*::tokenAuth`;
    const keysAuth = await redis.keys(patternAuth);

    if (keysAuth.length === 0) {
      logger.error('[sessionManager] No auth token found in Redis');
      throw new InvalidSessionError('auth token missing');
    }

    const authKey = keysAuth[0];

    const authToken = await redis.get(authKey);
    if (!authToken) {
      logger.error('[sessionManager] Auth token value is null');
      throw new InvalidSessionError('auth token null');
    }

    // Extract uid from the key: mystyc::{sessionId}::{deviceId}::{uid}::tokenAuth
    const uid = authKey.split('::')[3];
    logger.log('[sessionManager] Extracted UID:', uid);

    // Make sure session cookie matches deviceId and uid
    if (!validateSessionId(sessionId, deviceId, uid)) {
      logger.error('[sessionManager] Session validation failed - possible tampering');
      await this.clearSession();
      throw new InvalidSessionError('session validation failed');
    }

    // Get the refresh token for this session
    const refreshKey = `mystyc::${sessionId}::${deviceId}::${uid}::tokenRefresh`;
    const refreshToken = await redis.get(refreshKey);
    if (!refreshToken) {
      logger.error('[sessionManager] Refresh token value is null');
      throw new InvalidSessionError('refresh token null');
    }

    // Get session metadata
    const metadataKey = `mystyc::${sessionId}::${deviceId}::${uid}::metadata`;
    const metadata = await redis.hGetAll(metadataKey);
    if (!metadata.email) {
      logger.error('[sessionManager] Session metadata missing');
      throw new InvalidSessionError('session metadata missing');
    }

    logger.log('[sessionManager] Session retrieved successfully');
    return {
      authToken,
      refreshToken,
      sessionId,
      deviceId,
      uid,
      email: metadata.email,
      deviceName: metadata.deviceName || 'Unknown Device',
      isAdmin: metadata.isAdmin === 'true'      
    };
  },

  async getSessionAuthKey(sessionId: string) {
    await ensureConnection();

    const authKeys = await redis.keys(`mystyc::${sessionId}::*::*::tokenAuth`);
    if (authKeys.length === 0) {
      logger.error('[getSessionAuthKey] No auth token found for session');
      return null;
    }

    return  await redis.get(authKeys[0]);
  },

  async getDeviceSession(deviceId: string): Promise<string | null> {
    await ensureConnection();
    return await redis.get(`mystyc_device_session::${deviceId}`);
  },  

  async getSessions(limit: number = 20, offset: number = 0) {
    await ensureConnection();

    logger.log('[sessionManager] Getting sessions with limit:', limit, 'offset:', offset);

    const sessions = [];
    let cursor = '0';
    let totalFound = 0;

    do {
      const result = await redis.scan(cursor, {
        MATCH: 'mystyc::*::*::*::metadata',
        COUNT: 100
      });

      cursor = result.cursor;
      const metadataKeys = result.keys;

      for (const metadataKey of metadataKeys) {
        totalFound++;
        
        if (totalFound <= offset) continue;
        if (sessions.length >= limit) break;

        const keyParts = metadataKey.split('::');
        const sessionId = keyParts[1];
        const deviceId = keyParts[2];
        const uid = keyParts[3];

        // Get metadata
        const metadata = await redis.hGetAll(metadataKey);

        sessions.push({
          sessionId,
          deviceId,
          uid,
          email: metadata.email,
          deviceName: metadata.deviceName,
          isAdmin: metadata.isAdmin === 'true',
          createdAt: metadata.createdAt ? new Date(parseInt(metadata.createdAt)) : null
        });
      }

      if (sessions.length >= limit || cursor === '0') break;

    } while (cursor !== '0');

    return {
      data: sessions,
      pagination: {
        offset,
        limit,
        total: totalFound
      }
    };
  },

  async getSessionsDevices(limit: number = 20, offset: number = 0) {
    await ensureConnection();

    logger.log('[sessionManager] Getting sessions devices with limit:', limit, 'offset:', offset);

    const sessionsDevices = [];
    let cursor = '0';
    let totalFound = 0;

    do {
      const result = await redis.scan(cursor, {
        MATCH: 'mystyc_device_session::*',
        COUNT: 100
      });

      cursor = result.cursor;
      const metadataKeys = result.keys;

      for (const metadataKey of metadataKeys) {
        totalFound++;
        
        if (totalFound <= offset) continue;
        if (sessionsDevices.length >= limit) break;

        const keyParts = metadataKey.split('::');
        const deviceId = keyParts[1];
        const sessionId = await redis.get(metadataKey);

        sessionsDevices.push({
          deviceId,
          sessionId,
        });
      }

      if (sessionsDevices.length >= limit || cursor === '0') break;

    } while (cursor !== '0');

    return {
      data: sessionsDevices,
      pagination: {
        offset,
        limit,
        total: totalFound
      }
    };
  },

  async updateSession(
    sessionId: string,
    deviceId: string,
    uid: string,
    authToken: string,
    refreshToken: string
  ) {
    await ensureConnection();

    logger.log('[sessionManager] Updating session tokens for uid:', uid);

    const authTokenKey = `mystyc::${sessionId}::${deviceId}::${uid}::tokenAuth`;
    await redis.set(authTokenKey, authToken);
    logger.log('[sessionManager] Auth token updated');

    const refreshTokenKey = `mystyc::${sessionId}::${deviceId}::${uid}::tokenRefresh`;
    await redis.set(refreshTokenKey, refreshToken);
    logger.log('[sessionManager] Refresh token updated');
  },

  async clearSession(): Promise<void> {
    await ensureConnection();

    const cookieStore = await cookies();
    const cookieKeySession = getSessionCookieName();
    const encryptedSessionId = cookieStore.get(cookieKeySession)?.value;

    logger.log('[sessionManager] Clearing session', cookieKeySession, encryptedSessionId);

    if (encryptedSessionId) {
      const sessionId = decryptCookieValue(encryptedSessionId);
      const pattern = `mystyc::${sessionId}::*`;
      const keys = await redis.keys(pattern);
      
      if (keys.length > 0) {
        // Extract deviceId from first key to clear device mapping
        const firstKey = keys.find(key => key.endsWith('::tokenAuth'));
        if (firstKey) {
          const keyParts = firstKey.split('::');
          const deviceId = keyParts[2];
          await this.clearDeviceSession(deviceId);
        }
        
        await redis.del(keys);
        logger.log('[sessionManager] Deleted', keys.length, 'Redis keys and device mapping');
      }
    }
    
    cookieStore.delete(cookieKeySession);
    logger.log('[sessionManager] Session cookie cleared');
  },

  async clearDeviceSession(deviceId: string): Promise<void> {
    await ensureConnection();
    await redis.del(`mystyc_device_session::${deviceId}`);
    logger.log('[sessionManager] Device session mapping cleared:', deviceId.substring(0, 8));
  },

  async clearSessionByDeviceId(deviceId: string): Promise<void> {
    await ensureConnection();
    
    const sessionId = await this.getDeviceSession(deviceId);
    if (sessionId) {
      // Clear all session data
      const pattern = `mystyc::${sessionId}::*`;
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(keys);
        logger.log('[sessionManager] Cleared session by deviceId:', deviceId.substring(0, 8));
      }
      
      // Clear device mapping
      await this.clearDeviceSession(deviceId);
    }
  }
};