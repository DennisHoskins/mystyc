'use client';

import { useEffect } from 'react';

import '@/app/globals.css';

import { AuthProvider, useAuth } from '@/components/context/AuthContext';
import { BusyProvider } from '@/components/context/BusyContext';
import { TransitionProvider } from '@/components/context/TransitionContext';
import { ToastProvider } from '@/components/context/ToastContext';
import { OfflineProvider, useOffline } from '@/components/context/OfflineContext';
import { setConnectionErrorHandler } from '@/api/apiClient';
import { initializeGlobalErrorHandler } from '@/util/globalErrorHandler';

import TransitionManager from '@/components/layout/TransitionManager';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import ToastContainer from '@/components/ui/ToastContainer';

function TokenRefreshError({ onRetry, isOnline }: { onRetry: () => void; isOnline: boolean }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="text-center space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isOnline ? 'Session Error' : 'No Internet Connection'}
        </h1>
        <p className="text-gray-600 max-w-md">
          {isOnline 
            ? "We're having trouble maintaining your session. Please try again."
            : "Check your network connection and try again."
          }
        </p>
        <Button onClick={onRetry}>
          Retry
        </Button>
      </div>
    </div>
  );
}

function ConnectionError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="text-center space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Can't Connect to Server
        </h1>
        <p className="text-gray-600 max-w-md">
          We're unable to connect to our servers. Please check your internet connection and try again.
        </p>
        <Button onClick={onRetry}>
          Try Again
        </Button>
      </div>
    </div>
  );
}

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user, ready, tokenRefreshFailed, retryTokenRefresh } = useAuth();
  const { isOnline, showConnectionError, triggerConnectionError, clearConnectionError } = useOffline();
  
  useEffect(() => {
    setConnectionErrorHandler(triggerConnectionError);
    initializeGlobalErrorHandler();
  }, [triggerConnectionError]);

  if (!ready) return null;

  if (showConnectionError) {
    return <ConnectionError onRetry={clearConnectionError} />;
  }

  if (tokenRefreshFailed) {
    return <TokenRefreshError onRetry={retryTokenRefresh} isOnline={isOnline} />;
  }
  
  return (
    <ErrorBoundary 
      fallbackTitle="App Error"
      fallbackMessage="The app encountered an error. Please refresh the page."
    >
      <div className="flex min-h-screen flex-col">
        {user && <Header />}
        <div className="flex-1 flex flex-col">
          <TransitionManager>{children}</TransitionManager>
        </div>
        {user && <Footer />}
      </div>
    </ErrorBoundary>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <BusyProvider>
      <ErrorBoundary>
        <ToastProvider>
          <TransitionProvider>
            <OfflineProvider>
              <AuthProvider>
                <LayoutWrapper>{children}</LayoutWrapper>
              </AuthProvider>
            </OfflineProvider>
          </TransitionProvider>
          <ToastContainer />
        </ToastProvider>        
      </ErrorBoundary>
    </BusyProvider>
  );
}