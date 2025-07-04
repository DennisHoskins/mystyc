importScripts('/sw-env.js');

// pull in the compat SDKs
importScripts('https://www.gstatic.com/firebasejs/11.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.8.0/firebase-messaging-compat.js');

const {
  NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID,
} = self.__env;

firebase.initializeApp({
  apiKey:      NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:   NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:       NEXT_PUBLIC_FIREBASE_APP_ID,
});

const messaging = firebase.messaging();

// Handle raw PushEvents (DevTools “Push” button and FCM alike)
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data.json();
  } catch (e) {
    // not JSON, ignore or treat as text
  }

  const title =
    payload.data?.title ||
    (payload.notification && payload.notification.title) ||
    'New Message';

  const body =
    payload.data?.body ||
    (payload.notification && payload.notification.body) ||
    'You have a new message';

  const url =
    payload.data?.url ||
    (payload.notification && payload.notification.click_action) ||
    '/';

  const options = {
    body,
    icon: '/favicon/favicon.ico',
    badge: '/favicon/favicon.ico',
    tag: payload.messageId || Date.now().toString(),
    data: { url }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});

// Optional: log when closed
self.addEventListener('notificationclose', (event) => {
  // no-op or analytics
});
