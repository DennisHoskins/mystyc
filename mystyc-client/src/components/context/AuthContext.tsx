'use client';

import {
 createContext,
 useContext,
 useEffect,
 useState,
 ReactNode,
} from 'react';
import {
 User as FirebaseAuthUser,
 signInWithEmailAndPassword,
 createUserWithEmailAndPassword,
 signOut as firebaseSignOut,
 sendPasswordResetEmail,
 onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User } from '@/interfaces/user.interface';
import { UserProfile } from '@/interfaces/userProfile.interface';
import { logger } from '@/util/logger';
import { errorHandler } from '@/util/errorHandler';
import { useUserCache } from '@/hooks/useUserCache';
import { useUserAPI } from '@/hooks/useUserAPI';

interface AuthContextType {
 firebaseUser: FirebaseAuthUser | null;
 user: User | null;
 loading: boolean;
 ready: boolean;
 idToken: string | null;
 tokenRefreshFailed: boolean;
 retryTokenRefresh: () => Promise<void>;
 signIn: (email: string, password: string) => Promise<FirebaseAuthUser>;
 signOut: (skipRedirect?: boolean) => Promise<void>;
 register: (email: string, password: string) => Promise<FirebaseAuthUser>;
 resetPassword: (email: string) => Promise<void>;
 updateOnboardingProfile: (
   data: Partial<{ fullName?: string; dateOfBirth?: string; zodiacSign?: string }>
 ) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
 const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthUser | null>(null);
 const [user, setUser] = useState<User | null>(null);
 const [loading, setLoading] = useState(true);
 const [ready, setReady] = useState(false);
 const [idToken, setIdToken] = useState<string | null>(null);
 const [tokenRefreshFailed, setTokenRefreshFailed] = useState(false);
 const [isRefreshingToken, setIsRefreshingToken] = useState(false);
 const [hasLoadedCache, setHasLoadedCache] = useState(false);

 const { getCachedUser, clearCachedUser } = useUserCache(setUser);
 const { fetchCompleteUser, updateUserProfile } = useUserAPI();

 const updateIdToken = async (firebaseUser: FirebaseAuthUser | null) => {
   if (!firebaseUser) {
     setIdToken(null);
     setTokenRefreshFailed(false);
     return;
   }

   if (isRefreshingToken) return;
   
   setIsRefreshingToken(true);
   try {
     const token = await firebaseUser.getIdToken(true);
     setIdToken(token);
     setTokenRefreshFailed(false);
   } catch (err) {
     errorHandler.processError(err, {
       component: 'AuthContext',
       action: 'updateIdToken',
       userId: firebaseUser.uid
     });
     
     setIdToken(null);
     setTokenRefreshFailed(true);
   } finally {
     setIsRefreshingToken(false);
   }
 };

 const retryTokenRefresh = async () => {
   if (firebaseUser) {
     await updateIdToken(firebaseUser);
   }
 };

 useEffect(() => {
   const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
     setFirebaseUser(firebaseUser);
     await updateIdToken(firebaseUser);
     
     if (firebaseUser && !hasLoadedCache) {
       const cachedUser = getCachedUser(firebaseUser.uid);
       if (cachedUser) {
         logger.log('[AuthContext] Using cached user data');
         setUser(cachedUser);
       }
       setHasLoadedCache(true);
     } else if (!firebaseUser) {
       setUser(null);
       setHasLoadedCache(false);
     }
     
     setLoading(false);
     setReady(true);
   });

   return () => unsubscribe();
 }, []); // Remove getCachedUser from deps

 useEffect(() => {
   if (!firebaseUser || !idToken) return;
   const tokenRefreshInterval = setInterval(async () => {
     await updateIdToken(firebaseUser);
   }, 55 * 60 * 1000);
   return () => clearInterval(tokenRefreshInterval);
 }, [firebaseUser, idToken]);

 useEffect(() => {
   if (ready && idToken && firebaseUser && !user) {
     fetchCompleteUser(idToken, firebaseUser, setUser);
   }
 }, [ready, idToken, firebaseUser, user]); // Remove fetchCompleteUser from deps

 useEffect(() => {
   if (!firebaseUser) {
     setUser(null);
   }
 }, [firebaseUser]);

 const signIn = async (email: string, password: string): Promise<FirebaseAuthUser> => {
   setLoading(true);
   try {
     const result = await signInWithEmailAndPassword(auth, email, password);
     return result.user;
   } catch (err: any) {
     errorHandler.processError(err, {
       component: 'AuthContext',
       action: 'signIn'
     });
     throw err;
   } finally {
     setLoading(false);
   }
 };

 const register = async (email: string, password: string): Promise<FirebaseAuthUser> => {
   try {
     const result = await createUserWithEmailAndPassword(auth, email, password);
     return result.user;
   } catch (err: any) {
     errorHandler.processError(err, {
       component: 'AuthContext',
       action: 'register'
     });
     throw err;
   }
 };

 const signOut = async (skipRedirect = false) => {
   try {
     if (firebaseUser) {
       clearCachedUser(firebaseUser.uid);
     } else {
       clearCachedUser();
     }
     
     await firebaseSignOut(auth);
     setIdToken(null);
     setUser(null);
     setTokenRefreshFailed(false);
     if (!skipRedirect) {
       setReady(false);
       setLoading(false);
       window.location.href = '/';
     }
   } catch (err) {
     errorHandler.processError(err, {
       component: 'AuthContext',
       action: 'signOut',
       userId: firebaseUser?.uid
     });
     
     setIdToken(null);
     setUser(null);
     setTokenRefreshFailed(false);
   }
 };

 const resetPassword = async (email: string) => {
   const actionCodeSettings = {
     url: window.location.origin + '/login?reset=success',
     handleCodeInApp: true,
   };
   try {
     await sendPasswordResetEmail(auth, email, actionCodeSettings);
   } catch (err) {
     errorHandler.processError(err, {
       component: 'AuthContext',
       action: 'resetPassword'
     });
     throw err;
   }
 };

 const updateOnboardingProfile = async (
   data: Partial<{ fullName?: string; dateOfBirth?: string; zodiacSign?: string }>
 ) => {
   if (!idToken || !firebaseUser) throw new Error('Not authenticated');
   await updateUserProfile(idToken, firebaseUser, data, setUser, isRefreshingToken);
 };

 const value = {
   firebaseUser,
   user,
   loading,
   ready,
   idToken,
   tokenRefreshFailed,
   retryTokenRefresh,
   signIn,
   signOut,
   register,
   resetPassword,
   updateOnboardingProfile,
 };

 return <AuthContext.Provider value={value}>{ready ? children : null}</AuthContext.Provider>;
}

export const useAuth = () => {
 const context = useContext(AuthContext);
 if (context === undefined) {
   throw new Error('useAuth must be used within an AuthProvider');
 }
 return context;
};