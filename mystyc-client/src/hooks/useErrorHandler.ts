import { useCallback, useRef } from 'react';
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
 }, []);

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