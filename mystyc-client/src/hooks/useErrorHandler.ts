import { useCallback } from 'react';
import { useToast } from './useToast';
import { useAuth } from '@/components/context/AuthContext';
import { useCustomRouter } from './useCustomRouter';
import { errorHandler, ErrorContext, ProcessedError } from '@/util/errorHandler';

interface UseErrorHandlerOptions {
  component?: string;
  showToast?: boolean;
  onError?: (processedError: ProcessedError) => void;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { showToast } = useToast();
  const { signOut } = useAuth();
  const router = useCustomRouter();

  const handleError = useCallback((
    error: any, 
    context?: Partial<ErrorContext>
  ): ProcessedError => {
    // Build complete context
    const fullContext: ErrorContext = {
      component: options.component,
      ...context,
    };

    // Process the error
    const processedError = errorHandler.processError(error, fullContext);

    // Handle auth errors that require sign out
    if (errorHandler.isAuthError(error) && processedError.code === 'auth/invalid-credential') {
      // Don't auto-sign out for login failures, but do for session issues
      if (context?.action !== 'login' && context?.action !== 'register') {
        signOut(true);
        router.replace('/login');
      }
    }

    // Handle session expired errors
    if (processedError.code === '401') {
      signOut(true);
      router.replace('/login');
    }

    // Show toast if configured
    if ((options.showToast !== false) && processedError.shouldToast) {
      showToast(processedError.message);
    }

    // Call custom error handler if provided
    if (options.onError) {
      options.onError(processedError);
    }

    return processedError;
  }, [options, showToast, signOut, router]);

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