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

  return (
    <>
      {user &&
        <ParallaxContainer className='!fixed w-full h-full !overflow-hidden'>
          <></>
        </ParallaxContainer>
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