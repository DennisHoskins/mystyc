//import { useState, useEffect, useCallback } from 'react';
// import { getToken, onMessage } from 'firebase/messaging';

// import { messaging } from '@/api/firebase/apiFirebase';
// import { apiClient } from '@/api/client/apiClient';

// import { UpdateFcmToken } from '@/interfaces';

// import { useApp } from '@/components/context/AppContext';

// import { errorHandler } from '@/util/errorHandler';

// import { isUserOnboarded } from '@/util/util';
// import { logger } from '@/util/logger';

export function useFirebaseMessaging() {
  // const [fcmToken, setFcmToken] = useState<string | null>(null);
  // const [shouldRequestPermission, setShouldRequestPermission] = useState<boolean>(false);
  // const [error, setError] = useState<string | null>(null);
  // const { app } = useApp();

  // useEffect(() => {
  //   if (!app || !app.user || !isUserOnboarded(app.user.userProfile)) {
  //     return;
  //   }

  //   if (Notification.permission != "default") {
  //     return;
  //   }

  //   setShouldRequestPermission(true);
  // }, [app, setShouldRequestPermission]);

  // useEffect(() => {
  //   if (messaging) {
  //     const unsubscribe = onMessage(messaging, (payload) => {
  //       logger.log('Received foreground message:', payload);

  //       const title = payload.data?.title || payload.notification?.title || 'New Message';
  //       const body = payload.data?.body || payload.notification?.body || 'You have a new message';

  //       if ('Notification' in window && Notification.permission === 'granted') {
  //         try {
  //           const notification = new Notification(title, {
  //             body,
  //             icon: '/favicon/favicon.ico',
  //             badge: '/favicon/favicon.ico',
  //             tag: 'mystyc-foreground',
  //             requireInteraction: false,
  //           });

  //           setTimeout(() => {
  //             notification.close();
  //           }, 5000);

  //           notification.onclick = () => {
  //             window.focus();
  //             notification.close();
  //           };
  //         } catch (err) {
  //           logger.error('[useFirebaseMessaging] Error showing foreground notification:', err);
  //         }
  //       }
  //     });

  //     return () => unsubscribe();
  //   }
  // }, []);

  //const updateFcmTokenOnServer = async (fcmToken: string) => {
    // if (!app) {
    //   return;
    // }

    // if (!app.deviceId) {
    //   logger.warn('[useFirebaseMessaging] No device ID available for FCM token update');
    //   return;
    // }

    // try {
    //   const updateFcmToken: UpdateFcmToken = {
    //     deviceId: app.deviceId, 
    //     fcmToken
    //   }

    //   await apiClient.updateFcmToken(updateFcmToken);
    //   logger.log('[useFirebaseMessaging] FCM token updated on server successfully');
    // } catch (err) {
    //   errorHandler.processError(err, {
    //     component: 'useFirebaseMessaging',
    //     action: 'updateFcmToken',
    //     additional: { 
    //       deviceId: app.deviceId,
    //       hasToken: !!fcmToken
    //     }
    //   });

    //   logger.warn('[useFirebaseMessaging] Failed to update FCM token on server, continuing...');
    // }
  // }, [app]);
  //}, []);

  //const requestPermissionAndToken = useCallback(async () => {
    // try {
    //   if (!messaging) throw new Error('Messaging not supported');

    //   if ('serviceWorker' in navigator === false) {
    //     throw new Error('Messaging Service not supported');
    //   }

    //   let permission = Notification.permission;

    //   if (permission === 'default') {
    //     permission = await Notification.requestPermission();
    //   }

    //   if (permission !== 'granted') {
    //     throw new Error('Notification permission not granted');
    //   }

    //   const swPath = '/firebase-sw.js';

    //   const existing = await navigator.serviceWorker.getRegistration(swPath);
    //   const registration = existing ?? await navigator.serviceWorker.register(swPath);
    //   logger.log('Service‑worker ready:', registration);

    //   const fcmToken = await getToken(messaging, {
    //     vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    //     serviceWorkerRegistration: registration
    //   });

    //   setFcmToken(fcmToken);
    //   logger.log('[useFirebaseMessaging] FCM Token received:', fcmToken);

    //   await updateFcmTokenOnServer(fcmToken);
    //   return fcmToken;
    // } catch (err) {
    //   const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    //   setError(errorMessage);

    //   errorHandler.processError(err, {
    //     component: 'useFirebaseMessaging',
    //     action: 'requestPermissionAndToken'
    //   });

    //   logger.error('[useFirebaseMessaging] Error getting FCM token:', err);
    // }
  // }, [updateFcmTokenOnServer]);
  //}, []);

//   useEffect(() => {
//     if (!app || !app.deviceId) {
//       return;
//     }

//     const shouldAttempt = (
//       Notification.permission !== 'denied' &&
//       app.deviceId
//     );

//     if (!shouldAttempt) return;

//     requestPermissionAndToken();
//   }, [app, requestPermissionAndToken]);
  
//   useEffect(() => {
//     if (!messaging || !fcmToken || !app || !app.deviceId) return;

//     const handleTokenRefresh = async () => {
//       try {
//         if (!messaging) return;

//         const registration = await navigator.serviceWorker.getRegistration('/workers/notifications');
//         if (!registration) return;

//         const newToken = await getToken(messaging, {
//           vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
//           serviceWorkerRegistration: registration
//         });

//         if (newToken && newToken !== fcmToken) {
//           logger.log('[useFirebaseMessaging] FCM token refreshed:', newToken);
//           setFcmToken(newToken);
//           await updateFcmTokenOnServer(newToken);
//         }
//       } catch (err) {
//         errorHandler.processError(err, {
//           component: 'useFirebaseMessaging',
//           action: 'tokenRefresh'
//         });

//         logger.warn('[useFirebaseMessaging] Token refresh failed:', err);
//       }
//     };

//     const refreshInterval = setInterval(handleTokenRefresh, 24 * 60 * 60 * 1000);
//     return () => clearInterval(refreshInterval);
//   }, [fcmToken, app, updateFcmTokenOnServer]);

//  return { shouldRequestPermission, fcmToken, error, requestPermission: requestPermissionAndToken };
}