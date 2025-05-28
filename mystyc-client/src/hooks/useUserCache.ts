import { useEffect } from 'react';
import { User } from '@/interfaces/user.interface';
import { errorHandler } from '@/util/errorHandler';
import { logger } from '@/util/logger';

const getUserCacheKey = (firebaseUid: string) => `mystyc_user_${firebaseUid}`;
const CACHE_KEYS_STORAGE = 'mystyc_cache_keys';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CachedUser {
  data: User;
  timestamp: number;
}

const getCachedKeys = (): string[] => {
  try {
    const keys = sessionStorage.getItem(CACHE_KEYS_STORAGE);
    return keys ? JSON.parse(keys) : [];
  } catch {
    return [];
  }
};

const addCacheKey = (key: string) => {
  try {
    const keys = getCachedKeys();
    if (!keys.includes(key)) {
      keys.push(key);
      sessionStorage.setItem(CACHE_KEYS_STORAGE, JSON.stringify(keys));
    }
  } catch {}
};

const removeCacheKey = (key: string) => {
  try {
    const keys = getCachedKeys().filter(k => k !== key);
    sessionStorage.setItem(CACHE_KEYS_STORAGE, JSON.stringify(keys));
  } catch {}
};

export function useUserCache(onUserUpdate?: (userData: User) => void) {
  // Broadcast channel for cross-tab communication
  const broadcastChannel = new BroadcastChannel('user-cache-updates');

  // Listen for updates from other tabs
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'USER_UPDATED' && onUserUpdate) {
        logger.log('[useUserCache] Cross-tab user update received');
        
        // Update local cache
        const key = getUserCacheKey(event.data.firebaseUid);
        const cachedUser: CachedUser = {
          data: event.data.userData,
          timestamp: Date.now()
        };
        
        try {
          sessionStorage.setItem(key, JSON.stringify(cachedUser));
          // Trigger state update in AuthContext
          onUserUpdate(event.data.userData);
        } catch (err) {
          errorHandler.processError(err, {
            component: 'useUserCache',
            action: 'cross-tab-sync'
          });
        }
      }
    };

    broadcastChannel.addEventListener('message', handleMessage);
    
    return () => {
      broadcastChannel.removeEventListener('message', handleMessage);
      broadcastChannel.close();
    };
  }, [onUserUpdate]);

  const getCachedUser = (firebaseUid: string): User | null => {
    try {
      const cached = sessionStorage.getItem(getUserCacheKey(firebaseUid));
      if (cached) {
        const cachedUser: CachedUser = JSON.parse(cached);
        const isExpired = Date.now() - cachedUser.timestamp > CACHE_EXPIRY_MS;
        
        if (isExpired) {
          clearCachedUser(firebaseUid);
          return null;
        }
        
        return cachedUser.data;
      }
    } catch (err) {
      errorHandler.processError(err, {
        component: 'useUserCache',
        action: 'getCachedUser',
        userId: firebaseUid
      });
    }
    return null;
  };

  const setCachedUser = (firebaseUid: string, userData: User) => {
    try {
      const key = getUserCacheKey(firebaseUid);
      const cachedUser: CachedUser = {
        data: userData,
        timestamp: Date.now()
      };
      sessionStorage.setItem(key, JSON.stringify(cachedUser));
      addCacheKey(key);
      logger.log('[useUserCache] User data cached');
      
      // Broadcast to other tabs
      broadcastChannel.postMessage({
        type: 'USER_UPDATED',
        firebaseUid,
        userData
      });
      
    } catch (err) {
      errorHandler.processError(err, {
        component: 'useUserCache',
        action: 'setCachedUser',
        userId: firebaseUid
      });
    }
  };

  const clearCachedUser = (firebaseUid?: string) => {
    try {
      if (firebaseUid) {
        const key = getUserCacheKey(firebaseUid);
        sessionStorage.removeItem(key);
        removeCacheKey(key);
        logger.log('[useUserCache] User cache cleared');
      } else {
        getCachedKeys().forEach(key => {
          sessionStorage.removeItem(key);
        });
        sessionStorage.removeItem(CACHE_KEYS_STORAGE);
        logger.log('[useUserCache] All cache cleared');
      }
    } catch (err) {
      errorHandler.processError(err, {
        component: 'useUserCache',
        action: 'clearCachedUser',
        userId: firebaseUid
      });
    }
  };

  return {
    getCachedUser,
    setCachedUser,
    clearCachedUser
  };
}