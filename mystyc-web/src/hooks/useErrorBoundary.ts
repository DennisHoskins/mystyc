import { useCallback, useState } from 'react';
import { errorHandler } from '@/util/errorHandler';

interface UseErrorBoundaryReturn {
  showBoundary: (error: Error) => void;
  resetBoundary: () => void;
  hasError: boolean;
}

export function useErrorBoundary(): UseErrorBoundaryReturn {
  const [error, setError] = useState<Error | null>(null);

  const showBoundary = useCallback((error: Error) => {
    errorHandler.processError(error, {
      component: 'useErrorBoundary',
      action: 'manual-trigger',
      additional: { 
        asyncError: true,
        triggeredManually: true
      }
    });
    
    setError(error);
  }, []);

  const resetBoundary = useCallback(() => {
    setError(null);
  }, []);

  if (error) {
    throw error;
  }

  return {
    showBoundary,
    resetBoundary,
    hasError: !!error,
  };
}