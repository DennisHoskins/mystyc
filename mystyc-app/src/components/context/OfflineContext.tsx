'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type OfflineContextType = {
  isOnline: boolean;
  showConnectionError: boolean;
  triggerConnectionError: () => void;
  clearConnectionError: () => void;
};

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [showConnectionError, setShowConnectionError] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowConnectionError(false); // Clear error when back online
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const triggerConnectionError = () => {
    setShowConnectionError(true);
  };

  const clearConnectionError = () => {
    setShowConnectionError(false);
  };

  const value = {
    isOnline,
    showConnectionError,
    triggerConnectionError,
    clearConnectionError,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
}

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within OfflineProvider');
  }
  return context;
};