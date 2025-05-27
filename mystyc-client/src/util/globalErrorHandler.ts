import { errorHandler } from '@/util/errorHandler';

let isGlobalErrorHandlerInitialized = false;

export function initializeGlobalErrorHandler() {
  if (isGlobalErrorHandlerInitialized || typeof window === 'undefined') {
    return;
  }

  window.addEventListener('error', (event) => {
    errorHandler.processError(event.error || new Error(event.message), {
      component: 'Global',
      action: 'uncaught-error',
      additional: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        type: 'javascript-error'
      }
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorHandler.processError(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)), 
      {
        component: 'Global',
        action: 'unhandled-promise-rejection',
        additional: {
          type: 'promise-rejection',
          reason: String(event.reason)
        }
      }
    );
  });

  isGlobalErrorHandlerInitialized = true;
}

export function cleanupGlobalErrorHandler() {
  if (typeof window === 'undefined') return;
  
  isGlobalErrorHandlerInitialized = false;
}