import 'server-only';

import { 
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  User as FirebaseAuthUser,
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';

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
const auth = getAuth(app);

export const firebaseAuth = {
  signIn: async (email: string, password: string): Promise<FirebaseAuthUser> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (err: any) {
    logger.error('Firebase signIn error:', err);
      throw err;
    }
  },

  register: async (email: string, password: string): Promise<FirebaseAuthUser> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (err: any) {
    logger.error('Firebase register error:', err);
      throw err;
    }
  },

  resetPassword: async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
    logger.error('Firebase resetPassword error:', err);
      throw err;
    }
  },

  signOut: async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (err: any) {
    logger.error('Firebase signOut error:', err);
      throw err;
    }
  },

  getIdToken: async (firebaseUser: FirebaseAuthUser, forceRefresh = true): Promise<string> => {
    try {
      return await firebaseUser.getIdToken(forceRefresh);
    } catch (err: any) {
    logger.error('Firebase getIdToken error:', err);
      throw err;
    }
  }
};