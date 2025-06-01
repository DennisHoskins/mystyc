import { useCallback, useRef } from 'react';
import { useToast } from './useToast';
import { useAuth } from '@/components/context/AuthContext';
import { useCustomRouter } from './useCustomRouter';
import { useUserCache } from './useUserCache';
import { errorHandler, ErrorContext, ProcessedError } from '@/util/errorHandler';
import { storage } from '@/util/storage';

interface UseErrorHandlerOptions {
 component?: string;
 showToast?: boolean;
 onError?: (processedError: ProcessedError) => void;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { showToast } = useToast();
  const { signOut } = useAuth();
  const { clearCachedUser } = useUserCache();
  const router = useCustomRouter();

  const optionsRef = useRef(options);
  const showToastRef = useRef(showToast);
  const signOutRef = useRef(signOut);
  const routerRef = useRef(router);

  optionsRef.current = options;
  showToastRef.current = showToast;
  signOutRef.current = signOut;
  routerRef.current = router;

  const handleError = useCallback((
    error: any, 
    context?: Partial<ErrorContext>
  ): ProcessedError => {
    const currentOptions = optionsRef.current;

    const fullContext: ErrorContext = {
      component: currentOptions.component,
      ...context,
    };

    const processedError = errorHandler.processError(error, fullContext);

    // Handle force logout (revoked tokens) specially
    if (processedError.isForceLogout) {
      // Clear all auth state immediately
      signOutRef.current(true); // Skip redirect

      clearCachedUser();
      storage.session.removeItem('onboardingIntroShown');
     
      // Clear any cached user data
      const cacheKeys = storage.session.getItem('mystyc_cache_keys');
      if (cacheKeys) {
        try {
          const keys = JSON.parse(cacheKeys);
          keys.forEach((key: string) => storage.session.removeItem(key));
          storage.session.removeItem('mystyc_cache_keys');
        } catch {}
      }

      // Redirect to server logout page
      routerRef.current.replace('/server-logout');
      return processedError;
    }

    if (errorHandler.isAuthError(error) && processedError.code === 'auth/invalid-credential') {
      if (context?.action !== 'login' && context?.action !== 'register') {
        signOutRef.current(true);
        routerRef.current.replace('/login');
      }
    }

    if (processedError.code === '401') {
      signOutRef.current(true);
      routerRef.current.replace('/login');
    }

    if ((currentOptions.showToast !== false) && processedError.shouldToast) {
      showToastRef.current(processedError.message);
    }

    if (currentOptions.onError) {
      currentOptions.onError(processedError);
    }

    return processedError;
}, [clearCachedUser]);

const handleAuthError = useCallback((error: any, action: string): ProcessedError => {
  return handleError(error, { action });
}, [handleError]);

const handleApiError = useCallback((error: any, action: string): ProcessedError => {
  return handleError(error, { action });
}, [handleError]);

const isRetryable = useCallback((error: any): boolean => {
  return errorHandler.isRetryableError(error);
}, []);

const isNetworkError = useCallback((error: any): boolean => {
  return errorHandler.isNetworkError(error);
}, []);

  return {
    handleError,
    handleAuthError,
    handleApiError,
    isRetryable,
    isNetworkError,
  };
}