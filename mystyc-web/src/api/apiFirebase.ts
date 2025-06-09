import { 
 signInWithEmailAndPassword,
 createUserWithEmailAndPassword,
 signOut as firebaseSignOut,
 sendPasswordResetEmail,
 onAuthStateChanged,
 User as FirebaseAuthUser,
 Unsubscribe
} from 'firebase/auth';

import { auth } from '@/lib/firebase';
import { errorHandler } from '@/util/errorHandler';

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