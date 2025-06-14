import { createClient } from 'redis';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

// Create Redis client
const redis = createClient({
  url: process.env.REDIS_URL
});

// Connect to Redis (only connect once)
let isConnected = false;
async function ensureConnection() {
  if (!isConnected) {
    await redis.connect();
    isConnected = true;
  }
}

// 30 days in seconds timeout
const SESSION_TTL = 30 * 24 * 60 * 60; 

export const sessionManager = {

  async createSession(
    uid: string,
    deviceId: string, 
    idToken: string
  ): Promise<string> {
    await ensureConnection();
    
    const sessionId = uuidv4();
    
    const tokenKey = `mystyc::${sessionId}::${deviceId}::${uid}::token`;
    await redis.setEx(tokenKey, SESSION_TTL, idToken);

    // Set httpOnly cookies
    const cookieStore = await cookies();
    
    cookieStore.set('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_TTL,
      path: '/'
    });

    cookieStore.set('deviceId', deviceId, {
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
    const sessionId = cookieStore.get('sessionId')?.value;
    const deviceId = cookieStore.get('deviceId')?.value;
    
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
    const sessionId = cookieStore.get('sessionId')?.value;
    
    if (sessionId) {
      // Delete all keys for this session
      const pattern = `mystyc::${sessionId}::*`;
      const keys = await redis.keys(pattern);
      
      if (keys.length > 0) {
        await redis.del(keys);
      }
      
      cookieStore.delete('sessionId');
    }
  },

  async clearSessionDataOnly(): Promise<void> {
    await ensureConnection();
    
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('sessionId')?.value;
    
    if (sessionId) {
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