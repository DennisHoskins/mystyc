import { useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { Messaging, getMessaging, getToken, onMessage } from 'firebase/messaging';

import { useUser, useInitialized, useSetUser } from '@/components/ui/context/AppContext';
import { updateFcmToken } from '@/server/actions/user';
import { getDeviceInfo } from "@/util/getDeviceInfo";
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

const REFRESH_INTERVAL = 7 * 24 * 60 * 60 * 1000;

export function useFirebaseMessaging() {

 const initialized = useInitialized();
 const user = useUser();
 const setUser = useSetUser();

 const enableMessaging = useCallback(async () => {    
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

     const registration =
       existing ||
       (await navigator.serviceWorker.register(swPath));

     logger.log('[useFirebaseMessaging] Service-worker ready:', registration);

     const newToken = await getToken(messaging, {
       vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
       serviceWorkerRegistration: registration
     });
     logger.log('[useFirebaseMessaging] FCM Token received:', newToken);

     const updatedDevice = await updateFcmToken(getDeviceInfo(), user.device.deviceId, newToken);

     user.device = updatedDevice;
     setUser(user);

     logger.log('[useFirebaseMessaging] FCM Token updated on server successfully');
   } catch (err) {
     logger.error('[useFirebaseMessaging] Error enabling Firebase Messaging:', err);
     return;
   }
 }, [user, setUser]);

 useEffect(() => {
   if (!initialized || !user?.device) return;

   const { fcmToken, fcmTokenUpdatedAt } = user.device;
   if (!fcmToken ||!fcmTokenUpdatedAt) {
     return;
   }

   const last = new Date(fcmTokenUpdatedAt).getTime();
   if (fcmToken && Date.now() - last < REFRESH_INTERVAL) {
     logger.log("[useFirebaseMessaging] FCM token still fresh");
     return;
   }

   logger.log("[useFirebaseMessaging] FCM token stale, refreshing");
   enableMessaging();
 }, [initialized, user, enableMessaging]);  

 useEffect(() => {
   if (!initialized || !user || !user.device) {
     return;
   }

   if (user.device.fcmToken) {
     return;
   }

   if ('serviceWorker' in navigator === false) {
     logger.warn('[useFirebaseMessaging] Firebase Messaging not supported');
     return;
   }

   enableMessaging();
 }, [initialized, user, enableMessaging]);

 useEffect(() => {
   if (!messaging) {
     return;
   }
   const unsubscribe = onMessage(messaging, (payload) => {
     handleMessage(payload);
   });

   return () => unsubscribe();
 }, []);

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