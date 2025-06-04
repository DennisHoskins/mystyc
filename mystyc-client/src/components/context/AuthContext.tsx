'use client';

import {
 createContext,
 useContext,
 useEffect,
 useState,
 useRef,
 useCallback,
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
import { AuthEvent, User, Device } from '@/interfaces';
import { logger } from '@/util/logger';
import { errorHandler } from '@/util/errorHandler';
import { useUserCache } from '@/hooks/useUserCache';
import { useUserAPI } from '@/hooks/useUserAPI';
import { useDeviceInfo } from '@/hooks/useDeviceInfo';

interface AuthContextType {
 firebaseUser: FirebaseAuthUser | null;
 user: User | null;
 deviceData: Device | null;
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

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
 const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthUser | null>(null);
 const [user, setUser] = useState<User | null>(null);
 const [loading, setLoading] = useState(true);
 const [ready, setReady] = useState(false);
 const [idToken, setIdToken] = useState<string | null>(null);
 const [tokenRefreshFailed, setTokenRefreshFailed] = useState(false);
 const [isRefreshingToken, setIsRefreshingToken] = useState(false);
 const [hasLoadedCache, setHasLoadedCache] = useState(false);
 const [hasQuotaError, setHasQuotaError] = useState(false);
 const hasAttemptedDeviceRegistration = useRef(false);
 const hasInitializedDevice = useRef(false);

 const { getCachedUser, clearCachedUser } = useUserCache(setUser);
 const { fetchCompleteUserWithDevice, updateUserProfile } = useUserAPI();
 const { 
   deviceData, 
   initializeDeviceData, 
   clearDeviceData, 
   regenerateDeviceId 
 } = useDeviceInfo();

 const updateIdToken = useCallback(async (firebaseUser: FirebaseAuthUser | null) => {
   if (!firebaseUser) {
     setIdToken(null);
     setTokenRefreshFailed(false);
     return;
   }

   if (isRefreshingToken || hasQuotaError) {
     logger.log('[AuthContext] Skipping token update', { isRefreshingToken, hasQuotaError });
     return;
   }
   
   setIsRefreshingToken(true);
   logger.log('[AuthContext] Starting token update for user:', firebaseUser.uid);
   
   try {
     const token = await firebaseUser.getIdToken(true);
     setIdToken(token);
     setTokenRefreshFailed(false);
     setHasQuotaError(false);
     logger.log('[AuthContext] Token updated successfully');
   } catch (err: any) {
     logger.log('[AuthContext] Token update error:', err.message);
     
     // Handle revoked tokens - kill auth entirely
     if (err.code === 'auth/id-token-revoked') {
       logger.log('[AuthContext] Token revoked - killing auth flow');
       
       // Clear all state immediately
       setIdToken(null);
       setTokenRefreshFailed(false);
       setHasQuotaError(false);
       setUser(null);
       clearCachedUser();
       clearDeviceData();
       
       // Force redirect to server logout page
       window.location.href = '/server-logout';
       return;
     }
     
     if (err.message?.includes('quota-exceeded')) {
       setHasQuotaError(true);
       logger.log('[AuthContext] Quota exceeded - stopping token refresh attempts');
       return;
     }
     
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
 }, [isRefreshingToken, hasQuotaError, clearCachedUser, clearDeviceData]);

 const retryTokenRefresh = useCallback(async () => {
   if (firebaseUser) {
     setHasQuotaError(false);
     await updateIdToken(firebaseUser);
   }
 }, [firebaseUser, updateIdToken]);

  useEffect(() => {
   logger.log('[AuthContext] Setting up onAuthStateChanged listener');
   
   const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
     logger.log('[AuthContext] onAuthStateChanged triggered', { 
       hasUser: !!firebaseUser, 
       uid: firebaseUser?.uid
     });
     
     setFirebaseUser(firebaseUser);
     
     // Initialize device data when user logs in (only once)
     if (firebaseUser && !hasInitializedDevice.current) {
       hasInitializedDevice.current = true;
       initializeDeviceData(firebaseUser.uid);
     } else if (!firebaseUser) {
       hasInitializedDevice.current = false;
       clearDeviceData();
     }
     
     // Only update token on actual auth state changes, not on token refresh completion
     if (firebaseUser && !idToken) {
       await updateIdToken(firebaseUser);
     } else if (!firebaseUser) {
       setIdToken(null);
       setTokenRefreshFailed(false);
     }
     
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

   return () => {
     logger.log('[AuthContext] Cleaning up onAuthStateChanged listener');
     unsubscribe();
   };
 }, [getCachedUser, hasLoadedCache, updateIdToken, idToken, initializeDeviceData, clearDeviceData]);
 
 useEffect(() => {
   if (ready && idToken && firebaseUser && !user && deviceData && !hasAttemptedDeviceRegistration.current) {
     hasAttemptedDeviceRegistration.current = true;
     logger.log('[AuthContext] First auth - using device registration');
     
     const authEventData: AuthEvent = {
       firebaseUid: firebaseUser.uid,
       deviceId: deviceData.deviceId,
       ip: '127.0.0.1',
       platform: deviceData.platform,
       clientTimestamp: new Date().toISOString(),
       type: 'login'
     };
     
     fetchCompleteUserWithDevice(
       idToken, 
       firebaseUser, 
       deviceData, 
       authEventData, 
       setUser,
       regenerateDeviceId
     ).catch((error) => {
       logger.error('[AuthContext] Device registration failed', { error: error.message });
       hasAttemptedDeviceRegistration.current = false;
     });
   }
 }, [ready, idToken, firebaseUser, user, deviceData, fetchCompleteUserWithDevice, regenerateDeviceId]);

 useEffect(() => {
   if (!firebaseUser) {
     hasAttemptedDeviceRegistration.current = false;
     hasInitializedDevice.current = false;
     setUser(null);
   }
 }, [firebaseUser]);

 const signIn = async (email: string, password: string): Promise<FirebaseAuthUser> => {
   // Clear all auth state before sign in
   clearCachedUser();
   clearDeviceData();
   
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
   // Clear all auth state before register
   clearCachedUser();
   clearDeviceData();
   
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
     
     clearDeviceData();
     
     await firebaseSignOut(auth);
     setIdToken(null);
     setUser(null);
     setTokenRefreshFailed(false);
     setHasQuotaError(false);
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
     setHasQuotaError(false);
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
   deviceData,
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