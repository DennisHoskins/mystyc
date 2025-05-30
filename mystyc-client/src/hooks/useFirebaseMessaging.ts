import { useState, useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '@/lib/firebase';

export function useFirebaseMessaging() {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Received foreground message:', payload);
      });
      
      return () => unsubscribe();
    }
  }, []);

  const requestPermission = async () => {
    try {
      if (!messaging) {
        throw new Error('Messaging not supported');
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Register service worker
      //const registration = await registerServiceWorker();

      const fcmToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: await navigator.serviceWorker.register('/workers/notifications')
      });

      setToken(fcmToken);
      console.log('FCM Token:', fcmToken);
      return fcmToken;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error getting FCM token:', err);
    }
  };

  return { token, error, requestPermission };
}