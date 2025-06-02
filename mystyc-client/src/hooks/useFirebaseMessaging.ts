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
      
      // Don't throw - FCM token update failure shouldn't break the app
      logger.warn('[useFirebaseMessaging] Failed to update FCM token on server, continuing...');
    }
  }, [idToken, deviceData?.deviceId]);

  const requestPermission = useCallback(async () => {
    try {
      if (!messaging) {
        throw new Error('Messaging not supported');
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Register service worker
      const fcmToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: await navigator.serviceWorker.register('/workers/notifications')
      });

      setToken(fcmToken);
      logger.log('[useFirebaseMessaging] FCM Token received:', fcmToken);

      // Update FCM token on server
      await updateFcmTokenOnServer(fcmToken);
      
      return fcmToken;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      
      errorHandler.processError(err, {
        component: 'useFirebaseMessaging',
        action: 'requestPermission'
      });
      
      logger.error('[useFirebaseMessaging] Error getting FCM token:', err);
    }
  }, [updateFcmTokenOnServer]);

  // Auto-retrieve token if permission is already granted and we have device data
  useEffect(() => {
    if (Notification.permission === 'granted' && !token && !error && deviceData) {
      logger.log('[useFirebaseMessaging] Permission already granted and device ready, retrieving FCM token');
      requestPermission();
    }
  }, [token, error, requestPermission, deviceData]);

  // Handle token refresh events
  useEffect(() => {
    if (!messaging || !token || !deviceData) return;

    // Listen for token refresh
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

    // Check for token refresh periodically (every 24 hours)
    const refreshInterval = setInterval(handleTokenRefresh, 24 * 60 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [token, idToken, updateFcmTokenOnServer, deviceData]);

  return { token, error, requestPermission };
}