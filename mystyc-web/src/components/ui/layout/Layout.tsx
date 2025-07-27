'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { registerVisit } from '@/server/actions/analytics';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { useAppStore } from '@/store/appStore';
import { logger } from '@/util/logger'
import { TransitionProvider } from '@/components/ui/layout/context/TransitionContext';
import AppTransition from '@/components/ui/layout/transition/AppTransition';
import ServerLogoutForm from '@/components/auth/ServerLogoutForm';
import GlobalError from '@/components/ui/layout/GlobalError';
import Offline from '@/components/ui/layout/Offline';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isGlobalError = useAppStore((state) => state.isGlobalError);
  const setOnline = useAppStore((state) => state.setOnline);  
  const isOnline = useAppStore((state) => state.isOnline);

  useEffect(() => {
    registerVisit({
      deviceInfo: getDeviceInfo(),
      pathname,
      clientTimestamp: new Date().toISOString()
    }).catch(err => {
      logger.error('Analytics error:', err);
    });
  }, [pathname])  

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    setOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline]);  

  return (
    <>
      <TransitionProvider>
        <AppTransition>
          {isGlobalError
            ? <GlobalError />
            : !isOnline
            ? <Offline />
            : children
          }
        </AppTransition>
      </TransitionProvider>
      <ServerLogoutForm />
    </>
  );  
}