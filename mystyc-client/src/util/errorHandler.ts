import { logger } from './logger';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  additional?: Record<string, any>;
}

export interface ProcessedError {
  message: string;
  code?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  shouldLog: boolean;
  shouldToast: boolean;
  shouldRetry: boolean;
}

class ErrorHandler {
  // Firebase Auth Error Mappings
  private firebaseErrorMap: Record<string, ProcessedError> = {
    // Authentication Errors
    'auth/user-not-found': {
      message: 'No account found with this email. Please check your email or register for a new account.',
      code: 'auth/user-not-found',
      severity: 'low',
      shouldLog: false,
      shouldToast: false,
      shouldRetry: false,
    },
    'auth/wrong-password': {
      message: 'Incorrect password. Please try again or reset your password.',
      code: 'auth/wrong-password', 
      severity: 'low',
      shouldLog: false,
      shouldToast: false,
      shouldRetry: false,
    },
    'auth/invalid-email': {
      message: 'Please enter a valid email address.',
      code: 'auth/invalid-email',
      severity: 'low',
      shouldLog: false,
      shouldToast: false,
      shouldRetry: false,
    },
    'auth/email-already-in-use': {
      message: 'This email is already registered. Please sign in or reset your password.',
      code: 'auth/email-already-in-use',
      severity: 'low',
      shouldLog: false,
      shouldToast: false,
      shouldRetry: false,
    },
    'auth/weak-password': {
      message: 'Password must be at least 6 characters long.',
      code: 'auth/weak-password',
      severity: 'low',
      shouldLog: false,
      shouldToast: false,
      shouldRetry: false,
    },
    'auth/user-disabled': {
      message: 'This account has been disabled. Please contact support for assistance.',
      code: 'auth/user-disabled',
      severity: 'medium',
      shouldLog: true,
      shouldToast: true,
      shouldRetry: false,
    },
    'auth/too-many-requests': {
      message: 'Too many failed attempts. Please wait a few minutes before trying again.',
      code: 'auth/too-many-requests',
      severity: 'medium',
      shouldLog: true,
      shouldToast: true,
      shouldRetry: true,
    },
    'auth/network-request-failed': {
      message: 'Network error. Please check your internet connection and try again.',
      code: 'auth/network-request-failed',
      severity: 'medium',
      shouldLog: true,
      shouldToast: true,
      shouldRetry: true,
    },
    'auth/invalid-credential': {
      message: 'Invalid login credentials. Please check your email and password.',
      code: 'auth/invalid-credential',
      severity: 'low',
      shouldLog: false,
      shouldToast: false,
      shouldRetry: false,
    },
  };

  // API Error Mappings
  private apiErrorMap: Record<string, ProcessedError> = {
    // Network Errors
    'NetworkError': {
      message: 'Unable to connect to our servers. Please check your internet connection.',
      code: 'NetworkError',
      severity: 'medium',
      shouldLog: true,
      shouldToast: true,
      shouldRetry: true,
    },
    'TimeoutError': {
      message: 'Request timed out. Please try again.',
      code: 'TimeoutError',
      severity: 'medium',
      shouldLog: true,
      shouldToast: true,
      shouldRetry: true,
    },
    
    // HTTP Status Codes
    '400': {
      message: 'Invalid request. Please check your input and try again.',
      code: '400',
      severity: 'low',
      shouldLog: true,
      shouldToast: false,
      shouldRetry: false,
    },
    '401': {
      message: 'Your session has expired. Please sign in again.',
      code: '401',
      severity: 'medium',
      shouldLog: true,
      shouldToast: true,
      shouldRetry: false,
    },
    '403': {
      message: 'You do not have permission to perform this action.',
      code: '403',
      severity: 'medium',
      shouldLog: true,
      shouldToast: true,
      shouldRetry: false,
    },
    '404': {
      message: 'The requested information was not found.',
      code: '404',
      severity: 'low',
      shouldLog: true,
      shouldToast: false,
      shouldRetry: false,
    },
    '409': {
      message: 'This information already exists. Please try with different details.',
      code: '409',
      severity: 'low',
      shouldLog: false,
      shouldToast: false,
      shouldRetry: false,
    },
    '429': {
      message: 'Too many requests. Please wait a moment and try again.',
      code: '429',
      severity: 'medium',
      shouldLog: true,
      shouldToast: true,
      shouldRetry: true,
    },
    '500': {
      message: 'Something went wrong on our end. Please try again in a few moments.',
      code: '500',
      severity: 'high',
      shouldLog: true,
      shouldToast: true,
      shouldRetry: true,
    },
    '502': {
      message: 'Service temporarily unavailable. Please try again shortly.',
      code: '502',
      severity: 'high',
      shouldLog: true,
      shouldToast: true,
      shouldRetry: true,
    },
    '503': {
      message: 'Service is temporarily down for maintenance. Please try again later.',
      code: '503',
      severity: 'high',
      shouldLog: true,
      shouldToast: true,
      shouldRetry: true,
    },
  };

  // Default fallback error
  private defaultError: ProcessedError = {
    message: 'Something unexpected happened. Please try again.',
    severity: 'medium',
    shouldLog: true,
    shouldToast: true,
    shouldRetry: true,
  };

  processError(error: any, context?: ErrorContext): ProcessedError {
    let processedError: ProcessedError;

    // Extract error information
    const errorCode = this.extractErrorCode(error);
    const errorMessage = this.extractErrorMessage(error);

    // Try to find a mapped error
    if (errorCode && this.firebaseErrorMap[errorCode]) {
      processedError = { ...this.firebaseErrorMap[errorCode] };
    } else if (errorCode && this.apiErrorMap[errorCode]) {
      processedError = { ...this.apiErrorMap[errorCode] };
    } else {
      // Use default error
      processedError = { ...this.defaultError };
      
      // If we have a meaningful error message, use it
      if (errorMessage && errorMessage !== 'Unknown error') {
        processedError.message = errorMessage;
      }
    }

    // Log if necessary
    if (processedError.shouldLog || processedError.severity === 'critical') {
      this.logError(error, processedError, context);
    }

    return processedError;
  }

  private extractErrorCode(error: any): string | null {
    // Firebase errors
    if (error?.code) return error.code;
    
    // HTTP status codes
    if (error?.status) return error.status.toString();
    if (error?.response?.status) return error.response.status.toString();
    
    // Network errors
    if (error?.name === 'NetworkError') return 'NetworkError';
    if (error?.name === 'TimeoutError') return 'TimeoutError';
    if (error?.message?.includes('fetch')) return 'NetworkError';
    if (error?.message?.includes('timeout')) return 'TimeoutError';
    
    return null;
  }

  private extractErrorMessage(error: any): string {
    // Try various error message properties
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.data?.message) return error.data.message;
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.error?.message) return error.error.message;
    
    return 'Unknown error';
  }

  private logError(originalError: any, processedError: ProcessedError, context?: ErrorContext) {
    const logData = {
      code: processedError.code,
      severity: processedError.severity,
      message: this.extractErrorMessage(originalError),
      stack: originalError?.stack,
      ...context,
    };

    switch (processedError.severity) {
      case 'critical':
        logger.error('Critical error occurred', logData);
        break;
      case 'high':
        logger.error('High severity error', logData);
        break;
      case 'medium':
        logger.warn('Medium severity error', logData);
        break;
      case 'low':
        logger.log('Low severity error', logData);
        break;
    }
  }

  // Helper methods for common error scenarios
  isRetryableError(error: any): boolean {
    const processed = this.processError(error);
    return processed.shouldRetry;
  }

  isAuthError(error: any): boolean {
    const code = this.extractErrorCode(error);
    return code ? code.startsWith('auth/') : false;
  }

  isNetworkError(error: any): boolean {
    const code = this.extractErrorCode(error);
    return code === 'NetworkError' || code === 'TimeoutError';
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();