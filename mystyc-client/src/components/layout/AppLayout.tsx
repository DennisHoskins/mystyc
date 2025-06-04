'use client';

import { useEffect } from 'react';

import '@/app/globals.css';

import { initializeGlobalErrorHandler } from '@/util/globalErrorHandler';

import { useToast } from '@/hooks/useToast';
import { useFirebaseMessaging } from '@/hooks/useFirebaseMessaging';

import { AuthProvider, useAuth } from '@/components/context/AuthContext';
import { BusyProvider } from '@/components/context/BusyContext';
import { TransitionProvider } from '@/components/context/TransitionContext';
import { ToastProvider } from '@/components/context/ToastContext';
import { OfflineProvider, useOffline } from '@/components/context/OfflineContext';

import TransitionManager from '@/components/layout/TransitionManager';
import Header from '@/components/layout/header/Header';
import Footer from '@/components/layout/footer/Footer';

import ErrorBoundary from '@/components/ui/ErrorBoundary';
import ToastContainer from '@/components/ui/ToastContainer';
import Button from '@/components/ui/Button';

function TokenRefreshError({
  onRetry,
  isOnline,
}: {
  onRetry: () => void;
  isOnline: boolean;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="text-center space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
        <p className="text-gray-600 max-w-md">
          Failed to refresh authentication token. {isOnline ? 'Please try again.' : 'Check your connection.'}
        </p>
        <Button onClick={onRetry}>Try Again</Button>
      </div>
    </div>
  );
}

function ConnectionError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="text-center space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Can&apos;t Connect to Server</h1>
        <p className="text-gray-600 max-w-md">
          We&apos;re unable to connect to our servers. Please check your internet connection and try again.
        </p>
        <Button onClick={onRetry}>Try Again</Button>
      </div>
    </div>
  );
}

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { ready, tokenRefreshFailed, retryTokenRefresh } = useAuth();
  const { isOnline, showConnectionError, triggerConnectionError, clearConnectionError } = useOffline();

  useEffect(() => {
    initializeGlobalErrorHandler();
  }, [triggerConnectionError]);

  const { showToast } = useToast();
  const { requestPermission } = useFirebaseMessaging();

  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission !== 'denied') {
      requestPermission().catch((err) => {
        showToast('FCM permission or token failed: ' + (err?.message || err));
      });
    }
  }, [requestPermission, showToast]);

  if (!ready) return null;
  if (showConnectionError) return <ConnectionError onRetry={clearConnectionError} />;
  if (tokenRefreshFailed) return <TokenRefreshError onRetry={retryTokenRefresh} isOnline={isOnline} />;

  return (
    <ErrorBoundary
      fallbackTitle="App Error"
      fallbackMessage="The app encountered an error. Please refresh the page."
    >
      <div className="flex h-screen flex-col">
        <Header />

        <div className="flex flex-1 overflow-y-auto pb-16 md:pb-0">
          <TransitionManager>{children}</TransitionManager>
        </div>

        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default function App({ children }: { children: React.ReactNode }) {
  return (
    <BusyProvider>
      <ErrorBoundary fallbackTitle="App Error" fallbackMessage="Something unexpected happened">
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
