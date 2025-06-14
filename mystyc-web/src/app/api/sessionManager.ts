import { createClient } from 'redis';
import { cookies } from 'next/headers';
import { 
  getSessionCookieName, 
  getDeviceCookieName, 
  encryptCookieValue, 
  decryptCookieValue 
} from './keyManager';

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
  }
} 

export const sessionManager = {

  async createSession(
    uid: string,
    deviceId: string, 
    idToken: string,
    sessionId: string
  ): Promise<string> {
    await ensureConnection();
    
    const tokenKey = `mystyc::${sessionId}::${deviceId}::${uid}::token`;
    await redis.set(tokenKey, idToken);

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

    return sessionId;
  },

  async getCurrentSession(): Promise<{ token: string; sessionId: string; deviceId: string; uid: string } | null> {
    await ensureConnection();
    
    const cookieStore = await cookies();
    const encryptedSessionId = cookieStore.get(getSessionCookieName())?.value;
    const encryptedDeviceId = cookieStore.get(getDeviceCookieName())?.value;
    
    if (!encryptedSessionId || !encryptedDeviceId) {
      return null;
    }
    
    // Decrypt the cookie values
    const sessionId = decryptCookieValue(encryptedSessionId);
    const deviceId = decryptCookieValue(encryptedDeviceId);
    
    if (!sessionId || !deviceId) {
      return null;
    }
    
    // Get the token for this session
    const pattern = `mystyc::${sessionId}::${deviceId}::*::token`;
    const keys = await redis.keys(pattern);
    
    if (keys.length === 0) {
      return null;
    }
    
    const token = await redis.get(keys[0]);
    if (!token) {
      return null;
    }
    
    // Extract uid from the key: mystyc::{sessionId}::{deviceId}::{uid}::token
    const uid = keys[0].split('::')[3];
    
    return {
      token,
      sessionId,
      deviceId,
      uid
    };
  },

  async clearSession(): Promise<void> {
    await ensureConnection();
    
    const cookieStore = await cookies();
    const encryptedSessionId = cookieStore.get(getSessionCookieName())?.value;
    
    if (encryptedSessionId) {
      const sessionId = decryptCookieValue(encryptedSessionId);
      
      // Delete all keys for this session
      const pattern = `mystyc::${sessionId}::*`;
      const keys = await redis.keys(pattern);
      
      if (keys.length > 0) {
        await redis.del(keys);
      }
      
      cookieStore.delete(getSessionCookieName());
      cookieStore.delete(getDeviceCookieName());
    }
  },

  async clearSessionDataOnly(): Promise<void> {
    await ensureConnection();
    
    const cookieStore = await cookies();
    const encryptedSessionId = cookieStore.get(getSessionCookieName())?.value;
    
    if (encryptedSessionId) {
      const sessionId = decryptCookieValue(encryptedSessionId);
      console.log('Clearing session data only (no cookies)', { sessionId: sessionId.substring(0, 8) });
      
      // Delete all keys for this session from Redis only
      const pattern = `mystyc::${sessionId}::*`;
      const keys = await redis.keys(pattern);
      
      if (keys.length > 0) {
        await redis.del(keys);
        console.log(`Cleared ${keys.length} session keys from Redis`);
      }
    }
  }  
};