import { useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { Messaging, getMessaging, getToken, onMessage } from 'firebase/messaging';

import { useUser, useInitialized } from '@/components/layout/context/AppContext';
import { useAppStore } from '@/store/appStore';
import { apiClient } from '@/api/apiClient';
import { logger } from '@/util/logger';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
let messaging: Messaging | null = null;
if (typeof window !== 'undefined') {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    logger.error('Firebase Messaging not supported:', error);
  }
}
export { messaging };

export function useFirebaseMessaging() {

  const initialized = useInitialized();
  const user = useUser();
  // const { fcmToken, setFcmToken, lastTokenUpdate } = useAppStore();
  const { fcmToken, setFcmToken } = useAppStore();

  //
  // register fcmToken
  //
  useEffect(() => {

    logger.log("register fcmToken")

    if (!initialized || !user || !user.device) {
      return;
    }

    if (user.device.fcmToken) {
      if (fcmToken) {
        if (user.device.fcmToken === fcmToken) {
          logger.info("[useFirebaseMessaging] fcmToken loaded from Server", fcmToken);
        } else {
          logger.info("[useFirebaseMessaging] fcmToken Mismatch: App is out of sync", fcmToken, user.device.fcmToken);
        }
      } else {
        logger.info("[useFirebaseMessaging] fcmToken Mismatch, App is out of sync", fcmToken, user.device.fcmToken);
      }
      return;
    } else if (fcmToken) {
      logger.info("[useFirebaseMessaging] fcmToken Mismatch: Redis is out of sync", fcmToken, user.device.fcmToken);
      return;
    }

    if ('serviceWorker' in navigator === false) {
      logger.warn('[useFirebaseMessaging] Firebase Messaging not supported');
      return;
    }

    const enableMessaging = async () => {    
      if (!user || !user.device) {
        return;
      }

      if (!messaging) {
        logger.warn('[useFirebaseMessaging] Firebase Messaging not initialized');
        return;
      }
      try {
        let permission = Notification.permission;
        if (permission === 'default') {
          permission = await Notification.requestPermission();
        }
        if (permission !== 'granted') {
          logger.warn('[useFirebaseMessaging] Notification permission not granted');
          return;
        }

        const swPath = '/firebase-sw.js';
        const existing = await navigator.serviceWorker.getRegistration(swPath);
        const registration = existing ?? await navigator.serviceWorker.register(swPath);
        logger.log('[useFirebaseMessaging] Service‑worker ready:', registration);

        const newToken = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration
        });
        logger.log('[useFirebaseMessaging] FCM Token received:', newToken);

        if (newToken && newToken !== fcmToken) {
          await apiClient.updateFcmToken(user.device.deviceId, newToken);
          setFcmToken(newToken);
          logger.log('[useFirebaseMessaging] FCM Token updated on server successfully');
        }
      } catch (err) {
        logger.error('[useFirebaseMessaging] Error enabling Firebase Messaging:', err);
        return;
      }
    }
    enableMessaging();
  }, [initialized, user, fcmToken, setFcmToken]);

  //
  // refresh fcmToken
  //
  // useEffect(() => {
  //   if (!initialized) {
  //     return;
  //   }

  //   if (!messaging || !fcmToken || !user) return;

  //   const handleTokenRefresh = async () => {
  //     if (!user || !user.device) {
  //       return;
  //     }
      
  //     try {
  //       // Only refresh if token is older than 24 hours
  //       if (lastTokenUpdate && (Date.now() - lastTokenUpdate < 24 * 60 * 60 * 1000)) {
  //         return;
  //       }

  //       if (!messaging) return;

  //       const swPath = '/firebase-sw.js';
  //       const registration = await navigator.serviceWorker.getRegistration(swPath);
  //       if (!registration) return;

  //       const newToken = await getToken(messaging, {
  //         vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  //         serviceWorkerRegistration: registration
  //       });

  //       if (newToken && newToken !== fcmToken) {
  //         logger.log('[useFirebaseMessaging] FCM token refreshed:', newToken);
  //         await apiClient.updateFcmToken(user.device?.deviceId, newToken);
  //         setFcmToken(newToken);
  //         logger.log('[useFirebaseMessaging] Refreshed token updated on server successfully');
  //       }
  //     } catch (err) {
  //       logger.error('[useFirebaseMessaging] Token refresh failed:', err);
  //     }
  //   };

  //   // Check for token refresh every 24 hours
  //   const refreshInterval = setInterval(handleTokenRefresh, 24 * 60 * 60 * 1000);
  //   return () => clearInterval(refreshInterval);
  // }, [initialized, fcmToken, user, setFcmToken, lastTokenUpdate]);

  //
  // message received
  //
  useEffect(() => {
    if (!messaging) {
      return;
    }
    const unsubscribe = onMessage(messaging, (payload) => {
      handleMessage(payload);
    });

    return () => unsubscribe();
  }, []);

  //
  // handle message
  //
  const handleMessage = (payload: any) => {
    logger.log('Received foreground message:', payload);

    if ('Notification' in window === false || Notification.permission !== 'granted') {
      logger.log('Unable to display Notification - Not supported or no permission', Notification.permission);
      return;
    }

    const title = payload.data?.title || payload.notification?.title || 'New Message';
    const body = payload.data?.body || payload.notification?.body || 'You have a new message';
    try {
      const notification = new Notification(title, {
        body,
        icon: '/favicon/favicon.ico',
        badge: '/favicon/favicon.ico',
        tag: 'mystyc-foreground',
        requireInteraction: false,
      });

      setTimeout(() => {
        notification.close();
      }, 5000);

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (err) {
      logger.error('[useFirebaseMessaging] Error showing foreground notification:', err);
    }
  };  
}