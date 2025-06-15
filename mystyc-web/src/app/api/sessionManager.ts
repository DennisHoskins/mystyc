import { createClient } from 'redis';
import { cookies } from 'next/headers';
import { 
  getSessionCookieName, 
  getDeviceCookieName, 
  encryptCookieValue, 
  decryptCookieValue,
  validateSessionId 
} from './keyManager';
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
    sessionId: string
  ): Promise<string> {
    await ensureConnection();

    logger.log('[sessionManager] Creating session for uid:', uid, 'device:', deviceId.substring(0, 8));

    const authTokenKey = `mystyc::${sessionId}::${deviceId}::${uid}::tokenAuth`;
    await redis.set(authTokenKey, idTokens.authToken);
    logger.log('[sessionManager] Auth token stored in Redis');

    const refreshTokenKey = `mystyc::${sessionId}::${deviceId}::${uid}::tokenRefresh`;
    await redis.set(refreshTokenKey, idTokens.refreshToken);
    logger.log('[sessionManager] Refresh token stored in Redis');

    // Set httpOnly cookies with environment-appropriate names and encryption
    const cookieStore = await cookies();

    cookieStore.set(getSessionCookieName(), encryptCookieValue(sessionId), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    cookieStore.set(getDeviceCookieName(), encryptCookieValue(deviceId), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    logger.log('[sessionManager] Session cookies set');
    return sessionId;
  },

  async getCurrentSession(): Promise<{ 
    authToken: string; 
    refreshToken: string; 
    sessionId: string; 
    deviceId: string; 
    uid: string 
  } | null> {
    await ensureConnection();

    logger.log('[sessionManager] Getting current session');

    const cookieStore = await cookies();
    const encryptedSessionId = cookieStore.get(getSessionCookieName())?.value;
    const encryptedDeviceId = cookieStore.get(getDeviceCookieName())?.value;

    if (!encryptedSessionId || !encryptedDeviceId) {
      logger.log('[sessionManager] No session cookies found');
      return null;
    }

    // Decrypt the cookie values
    const sessionId = decryptCookieValue(encryptedSessionId);
    const deviceId = decryptCookieValue(encryptedDeviceId);

    if (!sessionId || !deviceId) {
      logger.error('[sessionManager] Failed to decrypt cookies');
      throw new InvalidSessionError('cookie decryption failed');
    }

    logger.log('[sessionManager] Session ID:', sessionId.substring(0, 8), 'Device ID:', deviceId.substring(0, 8));

    // Get the auth token for this session
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

    logger.log('[sessionManager] Session retrieved successfully');
    return {
      authToken,
      refreshToken,
      sessionId,
      deviceId,
      uid
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

    logger.log('[sessionManager] Clearing session', cookieKeySession);

    if (encryptedSessionId) {
      const sessionId = decryptCookieValue(encryptedSessionId);
      const pattern = `mystyc::${sessionId}::*`;
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(keys);
        logger.log('[sessionManager] Deleted', keys.length, 'Redis keys');
      }
    }
    cookieStore.delete(cookieKeySession);

    const cookieKeyDevice = getDeviceCookieName();
    logger.log('[sessionManager] Clearing device', cookieKeyDevice);
    cookieStore.delete(cookieKeyDevice);

    logger.log('[sessionManager] Session cookies cleared');
  }
};
