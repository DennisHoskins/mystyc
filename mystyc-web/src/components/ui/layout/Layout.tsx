'use client'

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { useUser } from '../context/AppContext';
import { registerVisit } from '@/server/actions/analytics';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { useAppStore } from '@/store/appStore';
import { logger } from '@/util/logger'
import Header from './Header';
import GlobalError from '@/components/ui/layout/GlobalError';
import Offline from '@/components/ui/layout/Offline';
import ParallaxContainer from '../parallax/ParallaxContainer';

export default function Layout({ children }: { children: React.ReactNode }) {
  const isGlobalError = useAppStore((state) => state.isGlobalError);
  const setOnline = useAppStore((state) => state.setOnline);  
  const isOnline = useAppStore((state) => state.isOnline);
  const pathname = usePathname();
  const user = useUser();

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
      {user &&
        <div className='fixed w-full h-full overflow-hidden'>
          <ParallaxContainer className='!overflow-hidden'>
            <></>
          </ParallaxContainer>
        </div>
      }
      <Header />
      {isGlobalError
        ? <GlobalError />
        : !isOnline
        ? <Offline />
        : children
      }
    </>
  );  
}