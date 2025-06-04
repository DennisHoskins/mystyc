import { useEffect, useRef } from 'react';
import { User } from '@/interfaces/user.interface';
import { errorHandler } from '@/util/errorHandler';
import { logger } from '@/util/logger';
import { storage } from '@/util/storage';

const getUserCacheKey = (firebaseUid: string) => `mystyc_user_${firebaseUid}`;
const CACHE_KEYS_STORAGE = 'mystyc_cache_keys';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CachedUser {
 data: User; // User = { firebaseUser, userProfile }
 timestamp: number;
}

const getCachedKeys = (): string[] => {
 try {
   const keys = storage.session.getItem(CACHE_KEYS_STORAGE);
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
     storage.session.setItem(CACHE_KEYS_STORAGE, JSON.stringify(keys));
   }
 } catch {}
};

const removeCacheKey = (key: string) => {
 try {
   const keys = getCachedKeys().filter(k => k !== key);
   storage.session.setItem(CACHE_KEYS_STORAGE, JSON.stringify(keys));
 } catch {}
};

export function useUserCache(onUserUpdate?: (userData: User) => void) {
 const tabId = useRef(Math.random().toString(36)); // Unique tab identifier
 const broadcastChannel = useRef(new BroadcastChannel('user-cache-updates'));

 // Listen for updates from other tabs
 useEffect(() => {
   const channel = broadcastChannel.current; // Capture current value
   
   const handleMessage = (event: MessageEvent) => {
     // Ignore messages from this tab
     if (event.data.senderId === tabId.current) {
       return;
     }
     
     if (event.data.type === 'USER_UPDATED' && onUserUpdate) {
       logger.log('[useUserCache] Cross-tab user update received');
       
       // Update local cache
       const key = getUserCacheKey(event.data.firebaseUid);
       const cachedUser: CachedUser = {
         data: event.data.userData, // User object { firebaseUser, userProfile }
         timestamp: Date.now()
       };
       
       try {
         storage.session.setItem(key, JSON.stringify(cachedUser));
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

   channel.addEventListener('message', handleMessage);
   
   return () => {
     channel.removeEventListener('message', handleMessage);
     channel.close();
   };
 }, [onUserUpdate]);

 const getCachedUser = (firebaseUid: string): User | null => {
   try {
     const cached = storage.session.getItem(getUserCacheKey(firebaseUid));
     if (cached) {
       const cachedUser: CachedUser = JSON.parse(cached);
       const isExpired = Date.now() - cachedUser.timestamp > CACHE_EXPIRY_MS;
       
       if (isExpired) {
         clearCachedUser(firebaseUid);
         return null;
       }
       
       return cachedUser.data; // Returns User object { firebaseUser, userProfile }
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

 const setCachedUser = (user: User) => {
   try {
     const key = getUserCacheKey(user.firebaseUser.uid);
     const cachedUser: CachedUser = {
       data: user,
       timestamp: Date.now()
     };
     storage.session.setItem(key, JSON.stringify(cachedUser));
     addCacheKey(key);
     logger.log('[useUserCache] User data cached');
     
     // Broadcast to other tabs - check if channel is still open
    //  try {
    //    broadcastChannel.current.postMessage({
    //      type: 'USER_UPDATED',
    //      firebaseUid: user.firebaseUser.uid,
    //      user,
    //      senderId: tabId.current
    //    });
    //  } catch {
    //    // Silently fail if broadcast fails - not critical for app functionality
    //    logger.log('[useUserCache] Cross-tab broadcast failed - channel may be closed');
    //  }
     
   } catch (err) {
     errorHandler.processError(err, {
       component: 'useUserCache',
       action: 'setCachedUser',
       userId: user.firebaseUser.uid
     });
   }
 };

 const clearCachedUser = (firebaseUid?: string) => {
   try {
     if (firebaseUid) {
       const key = getUserCacheKey(firebaseUid);
       storage.session.removeItem(key);
       removeCacheKey(key);
       logger.log('[useUserCache] User cache cleared');
     } else {
       getCachedKeys().forEach(key => {
         storage.session.removeItem(key);
       });
       storage.session.removeItem(CACHE_KEYS_STORAGE);
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