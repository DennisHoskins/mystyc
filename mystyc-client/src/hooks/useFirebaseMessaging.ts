import { useState, useEffect, useCallback } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '@/lib/firebase';
import { useAuth } from '@/components/context/AuthContext';
import { apiClient } from '@/api/apiClient';
import { errorHandler } from '@/util/errorHandler';
import { logger } from '@/util/logger';

export function useFirebaseMessaging() {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { idToken, deviceData } = useAuth();

  useEffect(() => {
    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        logger.log('Received foreground message:', payload);

        const title = payload.data?.title || payload.notification?.title || 'New Message';
        const body = payload.data?.body || payload.notification?.body || 'You have a new message';

        if ('Notification' in window && Notification.permission === 'granted') {
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
        }
      });

      return () => unsubscribe();
    }
  }, []);

  const updateFcmTokenOnServer = useCallback(async (fcmToken: string) => {
    if (!idToken) {
      logger.warn('[useFirebaseMessaging] No auth token available for FCM token update');
      return;
    }

    if (!deviceData?.deviceId) {
      logger.warn('[useFirebaseMessaging] No device ID available for FCM token update');
      return;
    }

    try {
      await apiClient.updateFcmToken(idToken, deviceData.deviceId, fcmToken);
      logger.log('[useFirebaseMessaging] FCM token updated on server successfully');
    } catch (err) {
      errorHandler.processError(err, {
        component: 'useFirebaseMessaging',
        action: 'updateFcmToken',
        additional: { 
          deviceId: deviceData.deviceId,
          hasToken: !!fcmToken
        }
      });

      logger.warn('[useFirebaseMessaging] Failed to update FCM token on server, continuing...');
    }
  }, [idToken, deviceData?.deviceId]);

  const requestPermissionAndToken = useCallback(async () => {
    try {
      if (!messaging) throw new Error('Messaging not supported');

      let permission = Notification.permission;

      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      if (permission !== 'granted') {
        throw new Error('Notification permission not granted');
      }

      const registration = await navigator.serviceWorker.register('/workers/notifications');
      logger.log('[useFirebaseMessaging] Service worker registered:', registration);

      const fcmToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration
      });

      setToken(fcmToken);
      logger.log('[useFirebaseMessaging] FCM Token received:', fcmToken);

      await updateFcmTokenOnServer(fcmToken);
      return fcmToken;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);

      errorHandler.processError(err, {
        component: 'useFirebaseMessaging',
        action: 'requestPermissionAndToken'
      });

      logger.error('[useFirebaseMessaging] Error getting FCM token:', err);
    }
  }, [updateFcmTokenOnServer]);

  useEffect(() => {
    const shouldAttempt = (
      Notification.permission !== 'denied' &&
      deviceData?.deviceId &&
      idToken
    );

    if (!shouldAttempt) return;

    requestPermissionAndToken();
  }, [deviceData?.deviceId, idToken, requestPermissionAndToken]);

  useEffect(() => {
    if (!messaging || !token || !deviceData) return;

    const handleTokenRefresh = async () => {
      try {
        if (!messaging) return;

        const registration = await navigator.serviceWorker.getRegistration('/workers/notifications');
        if (!registration) return;

        const newToken = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration
        });

        if (newToken && newToken !== token) {
          logger.log('[useFirebaseMessaging] FCM token refreshed:', newToken);
          setToken(newToken);
          await updateFcmTokenOnServer(newToken);
        }
      } catch (err) {
        errorHandler.processError(err, {
          component: 'useFirebaseMessaging',
          action: 'tokenRefresh'
        });

        logger.warn('[useFirebaseMessaging] Token refresh failed:', err);
      }
    };

    const refreshInterval = setInterval(handleTokenRefresh, 24 * 60 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, [token, idToken, updateFcmTokenOnServer, deviceData]);

  return { token, error, requestPermission: requestPermissionAndToken };
}