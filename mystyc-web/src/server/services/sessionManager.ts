import 'server-only';

import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import redis from '@/server/util/redisClient';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

import { 
  getSessionCookieName, 
  encryptCookieValue, 
  decryptCookieValue,
  // validateSessionId,
  // generateDeviceId 
} from './keyManager';
import { IdTokens } from './authTokenManager';
// import { extractDeviceFingerprint } from './deviceManager';

import { Session } from '@/interfaces/session.interface';
import { logger } from '@/util/logger';

const firebaseAdminApp = getApps().find(app => app.name === 'firebase-admin-app') || 
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  }, 'firebase-admin-app');
  
const adminAuth = getAuth(firebaseAdminApp!);

// custom error for any tampered / out-of-sync session
export class InvalidSessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSessionError';
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
    // Check for existing session on this device
    const existingSessionId = await this.getDeviceSession(deviceId);
    if (existingSessionId && existingSessionId !== sessionId) {
      logger.log('[sessionManager] Device already has session, clearing:', deviceId.substring(0, 8));
      await this.clearSessionByDeviceId(deviceId);
    }

    logger.log('[sessionManager] Creating session for uid:', uid, 'device:', deviceId.substring(0, 8));

    const now = Date.now().toString();

    // Store session data with timestamps
    const authTokenKey = `mystyc::${sessionId}::${deviceId}::${uid}::tokenAuth`;
    await redis.set(authTokenKey, idTokens.authToken);
    await redis.set(`${authTokenKey}:timestamp`, now);
    
    const refreshTokenKey = `mystyc::${sessionId}::${deviceId}::${uid}::tokenRefresh`;
    await redis.set(refreshTokenKey, idTokens.refreshToken);
    await redis.set(`${refreshTokenKey}:timestamp`, now);

    const metadataKey = `mystyc::${sessionId}::${deviceId}::${uid}::metadata`;
    await redis.hSet(metadataKey, {
      email,
      deviceName,
      isAdmin: isAdmin.toString(),
      createdAt: Date.now().toString(),
      lastUpdated: now
    });

    // Create device mapping
    await this.setDeviceSession(deviceId, sessionId, uid);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set(getSessionCookieName(), encryptCookieValue(sessionId), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 365 * 24 * 60 * 60       
    });

    logger.log('[sessionManager] Session created with device mapping');
    return sessionId;
  },

  async setDeviceSession(deviceId: string, sessionId: string, uid: string): Promise<void> {
    await redis.set(`mystyc_device_session::${deviceId}`, sessionId);
    await redis.set(`mystyc_device_session::${deviceId}::uid`, uid);
    logger.log('[sessionManager] Device session mapping created:', deviceId.substring(0, 8));
  },

  async getCurrentSession(request: NextRequest | Headers, deviceInfo: any): Promise<Session | null> {
    logger.log('');
    logger.log('[sessionManager] Getting current session');

    // Calculate deviceId from request
    if (!request) {
      logger.error('[sessionManager] No request provided for device calculation');
      return null;
    }

    if (!deviceInfo) {
      logger.error('[sessionManager] No deviceInfo provided for device calculation');
      return null;
    }

    // const fingerprint = extractDeviceFingerprint(request);
    // const deviceId = generateDeviceId(fingerprint, deviceInfo);
    const deviceId = deviceInfo.deviceId;
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
      await this.clearSession();
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
    // if (!validateSessionId(sessionId, deviceId, uid)) {
    //   logger.error('[sessionManager] Session validation failed - possible tampering');
    //   throw new InvalidSessionError('session validation failed');
    // }

    // Get session data
    const session = await this.getSessionData(sessionId, deviceId, uid, true);
    if (!session || !session.authToken) {
      logger.error('[sessionManager] Session data missing');
      throw new InvalidSessionError('session data missing');
    }

    try {
      await adminAuth.verifyIdToken(session.authToken, false);
      logger.log('[sessionManager] Token validated successfully');

      cookieStore.set(getSessionCookieName(), encryptedSessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 365 * 24 * 60 * 60,
      });      

      return session;
    } catch (error: any) {
      logger.log('[sessionManager] Token validation failed:', error.code);
      
      if (error.code === 'auth/id-token-expired') {
        // Token expired, try to refresh
        logger.log('[sessionManager] Token expired, attempting refresh');
        const refreshedSession = await this.refreshAuthToken(session);
        if (refreshedSession) {
          logger.log('[sessionManager] Token refresh successful');
          return refreshedSession;
        }
        // Refresh failed
        logger.error('[sessionManager] Token refresh failed');
        throw new InvalidSessionError('refresh failed');
      }
      
      // Token invalid for other reasons
      logger.error('[sessionManager] Token invalid:', error.code);
      throw new InvalidSessionError(error.code || 'invalid token');
    }
  },

  async getSession(sessionId: string): Promise<Session | null> {
    logger.log('[sessionManager] Getting session by sessionId:', sessionId.substring(0, 8));

    // Find auth token key for this sessionId
    const authKeys = await redis.keys(`mystyc::${sessionId}::*::*::tokenAuth`);
    if (authKeys.length === 0) {
      logger.error('[getSession] No auth token found for sessionId');
      return null;
    }

    const authKey = authKeys[0];
    const authToken = await redis.get(authKey);
    if (!authToken) {
      logger.error('[getSession] Auth token value is null');
      return null;
    }

    // Extract deviceId and uid from the key: mystyc::{sessionId}::{deviceId}::{uid}::tokenAuth
    const keyParts = authKey.split('::');
    const deviceId = keyParts[2];
    const uid = keyParts[3];

    logger.log('[sessionManager] Extracted deviceId:', deviceId.substring(0, 8), 'uid:', uid);

    // Use shared method to get session data
    return await this.getSessionData(sessionId, deviceId, uid, false);
  },

  async getSessionData(sessionId: string, deviceId: string, uid: string, throwErrors: boolean): Promise<Session | null> {
    // Get tokens and timestamps
    const refreshKey = `mystyc::${sessionId}::${deviceId}::${uid}::tokenRefresh`;
    const refreshToken = await redis.get(refreshKey);
    if (!refreshToken) {
      if (throwErrors) {
        logger.error('[getSessionData] Refresh token value is null');
        throw new InvalidSessionError('refresh token null');
      }
      return null;
    }

    const authKey = `mystyc::${sessionId}::${deviceId}::${uid}::tokenAuth`;
    const authToken = await redis.get(authKey);
    if (!authToken) {
      if (throwErrors) {
        logger.error('[getSessionData] Auth token value is null');
        throw new InvalidSessionError('auth token null');
      }
      return null;
    }

    // Get timestamps
    const authTimestamp = await redis.get(`${authKey}:timestamp`);
    const refreshTimestamp = await redis.get(`${refreshKey}:timestamp`);

    // Get session metadata
    const metadataKey = `mystyc::${sessionId}::${deviceId}::${uid}::metadata`;
    const metadata = await redis.hGetAll(metadataKey);
    if (!metadata.email) {
      if (throwErrors) {
        logger.error('[getSessionData] Session metadata missing');
        throw new InvalidSessionError('session metadata missing');
      }
      return null;
    }

    logger.log('[sessionManager] Session data retrieved successfully');
    return {
      sessionId,
      deviceId,
      uid,
      authToken,
      refreshToken,
      authTokenTimestamp: authTimestamp ? parseInt(authTimestamp) : 0,
      refreshTokenTimestamp: refreshTimestamp ? parseInt(refreshTimestamp) : 0,
      email: metadata.email,
      deviceName: metadata.deviceName || 'Unknown Device',
      isAdmin: metadata.isAdmin === 'true',
      createdAt: metadata.createdAt ? parseInt(metadata.createdAt) : 0,
      lastUpdated: metadata.lastUpdated ? parseInt(metadata.lastUpdated) : 0
    };
  },

  async refreshAuthToken(session: Session): Promise<Session | null> {
    logger.log('[sessionManager] Attempting token refresh for uid:', session.uid);
    try {
      const response = await fetch(
        `https://securetoken.googleapis.com/v1/token?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `grant_type=refresh_token&refresh_token=${session.refreshToken}`
        }
      );
      if (!response.ok) {
        logger.error('[sessionManager] Token refresh failed with status:', response.status);
        return null;
      }
      const data = await response.json();
      logger.log('[sessionManager] Token refreshed successfully');
      // Update tokens in Redis
      await this.updateSession(
        session.sessionId,
        session.deviceId,
        session.uid,
        data.id_token,
        data.refresh_token
      );
      logger.log('[sessionManager] Updated tokens in Redis');
      return {
        ...session,
        authToken: data.id_token,
        refreshToken: data.refresh_token,
        authTokenTimestamp: Date.now(),
        refreshTokenTimestamp: Date.now(),
        lastUpdated: Date.now()
      };
    } catch (error) {
      logger.error('[sessionManager] Token refresh failed:', error);
      return null;
    }
  },

  async getSessionAuthKey(sessionId: string) {
    const authKeys = await redis.keys(`mystyc::${sessionId}::*::*::tokenAuth`);
    if (authKeys.length === 0) {
      logger.error('[getSessionAuthKey] No auth token found for session');
      return null;
    }
    return await redis.get(authKeys[0]);
  },

  async getDeviceSession(deviceId: string): Promise<string | null> {
    return await redis.get(`mystyc_device_session::${deviceId}`);
  },

  async getDeviceUid(deviceId: string): Promise<string | null> {
    return await redis.get(`mystyc_device_session::${deviceId}::uid`);
  },

  async getTotalSessions(): Promise<number> {
    logger.log('[sessionManager] Getting total sessions count');
    let count = 0;
    let cursor = '0';
    do {
      const result = await redis.scan(cursor, { MATCH: 'mystyc::*::*::*::metadata', COUNT: 1000 });
      cursor = result.cursor;
      count += result.keys.length;
    } while (cursor !== '0');
    logger.log('[sessionManager] Total sessions:', count);
    return count;
  },

  async getTotalDevices(): Promise<number> {
    logger.log('[sessionManager] Getting total devices count');
    let count = 0;
    let cursor = '0';
    do {
      const result = await redis.scan(cursor, { MATCH: 'mystyc_device_session::*', COUNT: 1000 });
      cursor = result.cursor;
      count += result.keys.filter(key => !key.endsWith('::uid')).length;
    } while (cursor !== '0');
    logger.log('[sessionManager] Total devices:', count);
    return count;
  },

  async getSessions(limit: number = 20, offset: number = 0) {
    logger.log('[sessionManager] Getting sessions with limit:', limit, 'offset:', offset);
    const sessions = [];
    let cursor = '0';
    let totalFound = 0;
    do {
      const result = await redis.scan(cursor, { MATCH: 'mystyc::*::*::*::metadata', COUNT: limit });
      cursor = result.cursor;
      for (const metadataKey of result.keys) {
        totalFound++;
        if (totalFound <= offset) continue;
        if (sessions.length >= limit) break;
        const parts = metadataKey.split('::');
        const sessionId = parts[1];
        const deviceId = parts[2];
        const uid = parts[3];
        const metadata = await redis.hGetAll(metadataKey);
        sessions.push({
          sessionId,
          deviceId,
          uid,
          email: metadata.email,
          deviceName: metadata.deviceName,
          isAdmin: metadata.isAdmin === 'true',
          createdAt: metadata.createdAt ? new Date(parseInt(metadata.createdAt)).toString() : null
        });
      }
    } while (cursor !== '0' && sessions.length < limit);
    return { data: sessions, pagination: { offset, limit, totalItems: totalFound, totalPages: 1 } };
  },

  async getSessionsDevices(limit: number = 20, offset: number = 0) {
    logger.log('[sessionManager] Getting sessions devices with limit:', limit, 'offset:', offset);
    const sessionsDevices = [];
    let cursor = '0';
    let totalFound = 0;
    do {
      const result = await redis.scan(cursor, { MATCH: 'mystyc_device_session::*', COUNT: 100 });
      cursor = result.cursor;
      for (const metadataKey of result.keys) {
        totalFound++;
        if (totalFound <= offset) continue;
        if (sessionsDevices.length >= limit) break;
        const parts = metadataKey.split('::');
        const deviceId = parts[1];
        const sessionId = await redis.get(metadataKey);
        sessionsDevices.push({ deviceId, sessionId });
      }
    } while (cursor !== '0' && sessionsDevices.length < limit);
    return { data: sessionsDevices, pagination: { offset, limit, total: totalFound } };
  },

  async updateSession(
    sessionId: string,
    deviceId: string,
    uid: string,
    authToken: string,
    refreshToken: string
  ) {
    logger.log('[sessionManager] Updating session tokens for uid:', uid);
    const now = Date.now().toString();
    const authTokenKey = `mystyc::${sessionId}::${deviceId}::${uid}::tokenAuth`;
    await redis.set(authTokenKey, authToken);
    await redis.set(`${authTokenKey}:timestamp`, now);
    logger.log('[sessionManager] Auth token updated');
    const refreshTokenKey = `mystyc::${sessionId}::${deviceId}::${uid}::tokenRefresh`;
    await redis.set(refreshTokenKey, refreshToken);
    await redis.set(`${refreshTokenKey}:timestamp`, now);
    logger.log('[sessionManager] Refresh token updated');
    await redis.hSet(`mystyc::${sessionId}::${deviceId}::${uid}::metadata`, 'lastUpdated', now);
  },

  async updateSessionFcmToken(
    sessionId: string,
    deviceId: string,
    uid: string,
    fcmToken: string,
  ) {
    logger.log('[sessionManager] Updating session fcm token for uid:', uid);
    const now = Date.now().toString();
    const fcmTokenKey = `mystyc::${sessionId}::${deviceId}::${uid}::tokenFcm`;
    await redis.set(fcmTokenKey, fcmToken);
    await redis.set(`${fcmTokenKey}:timestamp`, now);
    logger.log('[sessionManager] Fcm token updated');
    await redis.hSet(`mystyc::${sessionId}::${deviceId}::${uid}::metadata`, 'lastUpdated', now);
  },

  async clearSession(): Promise<void> {
    logger.log('[sessionManager] Clearing session');
    const cookieStore = await cookies();
    const encryptedSessionId = cookieStore.get(getSessionCookieName())?.value;
    if (encryptedSessionId) {
      const sessionId = decryptCookieValue(encryptedSessionId);
      const keys = await redis.keys(`mystyc::${sessionId}::*`);
      if (keys.length) {
        const authKey = keys.find(key => key.endsWith('::tokenAuth'))!;
        const deviceId = authKey.split('::')[2];
        await this.clearDeviceSession(deviceId);
        await redis.del(keys);
        logger.log('[sessionManager] Deleted', keys.length, 'Redis keys and device mapping');
      }
    }
    cookieStore.delete(getSessionCookieName());
    logger.log('[sessionManager] Session cookie cleared');
  },

  async clearDeviceSession(deviceId: string): Promise<void> {
    await redis.del(`mystyc_device_session::${deviceId}`);
    logger.log('[sessionManager] Device session mapping cleared:', deviceId.substring(0, 8));
  },

  async clearSessionByDeviceId(deviceId: string): Promise<void> {
    const sessionId = await this.getDeviceSession(deviceId);
    if (sessionId) {
      const keys = await redis.keys(`mystyc::${sessionId}::*`);
      if (keys.length) {
        await redis.del(keys);
        logger.log('[sessionManager] Cleared session by deviceId:', deviceId.substring(0, 8));
      }
      await redis.del(`mystyc_device_session::${deviceId}`);
    }
  }
};
