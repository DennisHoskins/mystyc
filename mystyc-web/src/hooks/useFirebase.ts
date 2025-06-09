'use client';

import { useState, useEffect, useCallback } from 'react';
import { User as FirebaseAuthUser } from 'firebase/auth';

import { apiFirebase } from '@/api/apiFirebase';
import { useApp } from '@/components/context/AppContext';
import { useServerSync } from '@/hooks/useServerSync';
import { logger } from '@/util/logger';

export function useFirebase() {
  const { app, setApp } = useApp();
  const { syncToServer } = useServerSync();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthUser | null>(null);
  const [tokenRefreshFailed, setTokenRefreshFailed] = useState(false);
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);
  const [hasQuotaError, setHasQuotaError] = useState(false);
  const [loading, setLoading] = useState(true);

  const updateIdToken = useCallback(async (firebaseUser: FirebaseAuthUser | null) => {
    if (!app) {
      return;
    }
    if (!firebaseUser) {
      const newAppState = { 
        authToken: null,
        user: app.user,
        fcmToken: app.fcmToken
      };
      setApp(newAppState);
      await syncToServer(newAppState);
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
      const newAppState = { ...app, authToken: token };
      setApp(newAppState);
      await syncToServer(newAppState);
      setTokenRefreshFailed(false);
      setHasQuotaError(false);
      logger.log('[useFirebase] Token updated successfully');
    } catch (err: any) {
      logger.log('[useFirebase] Token update error:', err.message);
      
      // Handle revoked tokens - kill auth entirely
      if (err.code === 'auth/id-token-revoked') {
        logger.log('[useFirebase] Token revoked - killing auth flow');
        
        // Clear all state immediately
        const clearedState = { authToken: null, user: null, fcmToken: null };
        setApp(clearedState);
        await syncToServer(clearedState);
        
        // Force redirect to server logout page
        window.location.href = '/server-logout';
        return;
      }
      
      if (err.message?.includes('quota-exceeded')) {
        setHasQuotaError(true);
        logger.log('[useFirebase] Quota exceeded - stopping token refresh attempts');
        return;
      }
      
      const newAppState = { ...app, authToken: null };
      setApp(newAppState);
      await syncToServer(newAppState);
      setTokenRefreshFailed(true);
    } finally {
      setIsRefreshingToken(false);
    }
  }, [isRefreshingToken, hasQuotaError, app, setApp, syncToServer]);

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
      if (firebaseUser && !app?.authToken) {
        await updateIdToken(firebaseUser);
      } else if (!firebaseUser) {
        const clearedState = { authToken: null, user: null, fcmToken: null };
        setApp(clearedState);
        await syncToServer(clearedState);
        setTokenRefreshFailed(false);
      }
      
      setLoading(false);
    });

    return () => {
      logger.log('[useFirebase] Cleaning up onAuthStateChanged listener');
      unsubscribe();
    };
  }, [updateIdToken, app, setApp, syncToServer]);

  return {
    firebaseUser,
    authToken: app?.authToken,
    tokenRefreshFailed,
    retryTokenRefresh,
    loading,
    isRefreshingToken
  };
}