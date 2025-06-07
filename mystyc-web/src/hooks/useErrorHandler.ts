import { useCallback, useRef } from 'react';
import { useToast } from './useToast';
import { useAuth } from '@/components/context/AuthContext';
import { useCustomRouter } from './useCustomRouter';
import { errorHandler, ErrorContext, ProcessedError } from '@/util/errorHandler';
import { apiClient } from '@/api/apiClient';  // ← added import
import type { AuthEvent } from '@/interfaces/authEvent.interface';

interface UseErrorHandlerOptions {
  component?: string;
  showToast?: boolean;
  onError?: (processedError: ProcessedError) => void;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { showToast } = useToast();

  const { idToken, deviceData, firebaseUser, signOut } = useAuth();  // ← added deviceData, idToken, firebaseUser
  const routerRef = useRef(useCustomRouter());
  const signOutRef = useRef(signOut);
  const showToastRef = useRef(showToast);
  const optionsRef = useRef(options);

  // keep refs in sync
  signOutRef.current = signOut;
  showToastRef.current = showToast;
  optionsRef.current = options;

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

    if (processedError.isForceLogout) {
      if (deviceData && idToken && firebaseUser) {
        const authEvent: AuthEvent = {
          firebaseUid: firebaseUser.uid,
          deviceId: deviceData.deviceId,
          ip: '',
          platform: deviceData.platform,
          clientTimestamp: new Date().toISOString(),
          type: 'logout',
        };
        apiClient.logout({
          device: deviceData, 
          authEvent
        }).catch((err) =>
            errorHandler.processError(err, {
              component: 'useErrorHandler',
              action: 'logoutTracking',
            })
          );
      }

      if (context?.action !== 'login' && context?.action !== 'register') {
        signOutRef.current(true);
        routerRef.current.replace('/login');
      }
    }

    if (processedError.code === '401') {
      if (deviceData && idToken && firebaseUser) {
        const authEvent: AuthEvent = {
          firebaseUid: firebaseUser.uid,
          deviceId: deviceData.deviceId,
          ip: '',
          platform: deviceData.platform,
          clientTimestamp: new Date().toISOString(),
          type: 'logout',
        };
        apiClient.logout({ 
          device: deviceData, 
          authEvent
        }).catch((err) =>
            errorHandler.processError(err, {
              component: 'useErrorHandler',
              action: 'logoutTracking',
            })
          );
      }

      signOutRef.current(true);
      routerRef.current.replace('/login');
    }

    if ((currentOptions.showToast !== false) && processedError.shouldToast) {
      showToastRef.current(processedError.message);
    }

    return processedError;
  }, [firebaseUser, idToken, deviceData]);

  const handleAuthError = useCallback((error: any) => {
    return handleError(error, { component: 'AuthHandler', action: 'auth' });
  }, [handleError]);

  const handleApiError = useCallback((error: any) => {
    return handleError(error, { component: 'ApiHandler', action: 'api' });
  }, [handleError]);

  const isRetryable = useCallback((error: any): boolean => {
    return errorHandler.isNetworkError(error);
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
