import { useCallback, useRef } from 'react';
//import { useToast } from './useToast';
import { useAuth } from '@/hooks/useAuth';
import { useCustomRouter } from './useCustomRouter';
import { errorHandler, ErrorContext, ProcessedError } from '@/util/errorHandler';
// import { apiClient } from '@/api/client/apiClient';  // ← added import
// import type { AuthEventLogout } from '@/interfaces/authEventLogout.interface';

interface UseErrorHandlerOptions {
  component?: string;
  showToast?: boolean;
  onError?: (processedError: ProcessedError) => void;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
//  const { showToast } = useToast();

  const { signOut } = useAuth();
  const routerRef = useRef(useCustomRouter());
  const signOutRef = useRef(signOut);
//  const showToastRef = useRef(showToast);
  const optionsRef = useRef(options);

  // keep refs in sync
  signOutRef.current = signOut;
//  showToastRef.current = showToast;
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

    const deviceData = {
      deviceId: ""
    }

    const processedError = errorHandler.processError(error, fullContext);

    if (processedError.isForceLogout) {
      // if (deviceData) {
      //   const authEvent: AuthEventLogout = {
      //     deviceId: deviceData.deviceId,
      //     clientTimestamp: new Date().toISOString(),
      //   };
      //   apiClient.logout(authEvent)
      //     .catch((err) =>
      //       errorHandler.processError(err, {
      //         component: 'useErrorHandler',
      //         action: 'logoutTracking',
      //       })
      //     );
      // }

      if (context?.action !== 'login' && context?.action !== 'register') {
        signOutRef.current();
        routerRef.current.replace('/login');
      }
    }

    if (processedError.code === '401') {
      if (deviceData) {
        // const authEvent: AuthEventLogout = {
        //   deviceId: deviceData.deviceId,
        //   clientTimestamp: new Date().toISOString(),
        // };
        // apiClient.logout(authEvent)
        //   .catch((err) =>
        //     errorHandler.processError(err, {
        //       component: 'useErrorHandler',
        //       action: 'logoutTracking',
        //     })
        //   );
      }

      signOutRef.current();
      routerRef.current.replace('/login');
    }

    if ((currentOptions.showToast !== false) && processedError.shouldToast) {
//      showToastRef.current(processedError.message);
    }

    return processedError;
  }, []);

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
