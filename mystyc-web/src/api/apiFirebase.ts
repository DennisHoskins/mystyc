import { 
  getAuth,
 signInWithEmailAndPassword,
 createUserWithEmailAndPassword,
 signOut as firebaseSignOut,
 sendPasswordResetEmail,
 onAuthStateChanged,
 User as FirebaseAuthUser,
 Unsubscribe
} from 'firebase/auth';

import { initializeApp } from 'firebase/app';
import { Messaging, getMessaging } from 'firebase/messaging';

import { errorHandler } from '@/util/errorHandler';

console.log("!!!!!");
console.log("!!!!!LOADING FIREBASE CONFIG");
console.log("!!!!!");

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let messaging: Messaging | null = null;
if (typeof window !== 'undefined') {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    alert(error);
    console.log('Firebase Messaging not supported:', error);
  }
}
export { messaging };

export const apiFirebase = {
 signIn: async (email: string, password: string): Promise<FirebaseAuthUser> => {
   try {
     const result = await signInWithEmailAndPassword(auth, email, password);
     return result.user;
   } catch (err: any) {
     errorHandler.processError(err, {
       component: 'apiFirebase',
       action: 'signIn'
     });
     throw err;
   }
 },

 register: async (email: string, password: string): Promise<FirebaseAuthUser> => {
   try {
     const result = await createUserWithEmailAndPassword(auth, email, password);
     return result.user;
   } catch (err: any) {
     errorHandler.processError(err, {
       component: 'apiFirebase',
       action: 'register'
     });
     throw err;
   }
 },

 signOut: async (): Promise<void> => {
   try {
     await firebaseSignOut(auth);
   } catch (err: any) {
     errorHandler.processError(err, {
       component: 'apiFirebase',
       action: 'signOut'
     });
     throw err;
   }
 },

 resetPassword: async (email: string): Promise<void> => {
   const actionCodeSettings = {
     url: window.location.origin + '/login?reset=success',
     handleCodeInApp: true,
   };
   
   try {
     await sendPasswordResetEmail(auth, email, actionCodeSettings);
   } catch (err: any) {
     errorHandler.processError(err, {
       component: 'apiFirebase',
       action: 'resetPassword'
     });
     throw err;
   }
 },

 getIdToken: async (firebaseUser: FirebaseAuthUser, forceRefresh = true): Promise<string> => {
   try {
     return await firebaseUser.getIdToken(forceRefresh);
   } catch (err: any) {
     errorHandler.processError(err, {
       component: 'apiFirebase',
       action: 'getIdToken',
       userId: firebaseUser.uid
     });
     throw err;
   }
 },

 onAuthStateChanged: (callback: (user: FirebaseAuthUser | null) => void): Unsubscribe => {
   return onAuthStateChanged(auth, callback);
 }
};