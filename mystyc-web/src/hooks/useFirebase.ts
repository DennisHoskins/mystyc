'use client';

import { useState, useEffect, useCallback } from 'react';
import { User as FirebaseAuthUser } from 'firebase/auth';

import { apiFirebase } from '@/api/firebase/apiFirebase';
import { apiClient } from '@/api/client/apiClient';
import { useApp } from '@/components/context/AppContext';
import { logger } from '@/util/logger';

export function useFirebase() {
 const { setApp } = useApp();
 const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthUser | null>(null);
 const [tokenRefreshFailed, setTokenRefreshFailed] = useState(false);
 const [isRefreshingToken, setIsRefreshingToken] = useState(false);
 const [hasQuotaError, setHasQuotaError] = useState(false);
 const [loading, setLoading] = useState(true);

 const updateIdToken = useCallback(async (firebaseUser: FirebaseAuthUser | null) => {
   if (!firebaseUser) {
     const newAppState = { 
       deviceId: null,
       user: null,
       fcmToken: null
     };
     setApp(newAppState);
     setTokenRefreshFailed(false);
     return;
   }

   if (isRefreshingToken || hasQuotaError) {
     logger.log('[useFirebase] Skipping token update', { isRefreshingToken, hasQuotaError });
     return;
   }
   
   setIsRefreshingToken(true);
   logger.log('[useFirebase] Starting token update for user:', firebaseUser.uid);
   
   try {
     const token = await apiFirebase.getIdToken(firebaseUser, true);

     // Send fresh token to server
     await apiClient.refreshToken(token);
     
     setTokenRefreshFailed(false);
     setHasQuotaError(false);
     logger.log('[useFirebase] Token updated successfully');
   } catch (err: any) {
     logger.log('[useFirebase] Token update error:', err.message);
     
     // Handle revoked tokens - kill auth entirely
     if (err.code === 'auth/id-token-revoked') {
       logger.log('[useFirebase] Token revoked - killing auth flow');
       
       // Clear all state immediately
       const clearedState = { 
         deviceId: null,
         user: null, 
         fcmToken: null 
       };
       setApp(clearedState);

       // Force redirect to server logout page
       window.location.href = '/server-logout';
       return;
     }
     
     if (err.message?.includes('quota-exceeded')) {
       setHasQuotaError(true);
       logger.log('[useFirebase] Quota exceeded - stopping token refresh attempts');
       return;
     }
     
     setTokenRefreshFailed(true);
   } finally {
     setIsRefreshingToken(false);
   }
 }, [isRefreshingToken, hasQuotaError, setApp]);

 const retryTokenRefresh = useCallback(async () => {
   if (firebaseUser) {
     setHasQuotaError(false);
     await updateIdToken(firebaseUser);
   }
 }, [firebaseUser, updateIdToken]);

 // Auth state listener
 useEffect(() => {
   logger.log('[useFirebase] Setting up onAuthStateChanged listener');
   
   const unsubscribe = apiFirebase.onAuthStateChanged(async (firebaseUser) => {
     logger.log('[useFirebase] onAuthStateChanged triggered', { 
       hasUser: !!firebaseUser, 
       uid: firebaseUser?.uid
     });
     
     setFirebaseUser(firebaseUser);
     
     // Only update token on actual auth state changes
     if (firebaseUser) {
       await updateIdToken(firebaseUser);
     } else if (!firebaseUser) {
       const clearedState = { 
         deviceId: null,
         user: null, 
         fcmToken: null 
       };
       setApp(clearedState);

       setTokenRefreshFailed(false);
     }
     
     setLoading(false);
   });

   return () => {
     logger.log('[useFirebase] Cleaning up onAuthStateChanged listener');
     unsubscribe();
   };
 }, [updateIdToken, setApp]);

 return {
   firebaseUser,
   tokenRefreshFailed,
   retryTokenRefresh,
   loading,
   isRefreshingToken
 };
}