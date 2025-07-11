'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useBusy, useUser } from '@/components/ui/layout/context/AppContext';
import { useTransitions } from '@/components/ui/layout/context/TransitionContext';
import { logger } from '@/util/logger';
import { useRef } from 'react';

export function useTransitionRouter() {
  const router = useRouter();
  const path = usePathname();
  const user = useUser();
  const { pageTransitionRef, appTransitionRef } = useTransitions();
  const { setBusy } = useBusy();
  const transitioningRef = useRef(false);

  const navigate = async (
    href: string,
    method: 'push' | 'replace',
    transition = true
  ) => {
    if (transitioningRef.current) {
      logger.log('[ROUTER]: Transition already in progress, ignoring');
      return;
    }

    if (href === path) {
      logger.log('[ROUTER]: Skipping transition for same path');
      return;
    }

    if (user) {
      if (
        href === '/login' ||
        path === '/login' ||
        href === '/register' ||
        path === '/register' ||
        href === '/password-reset' ||
        path === '/password-reset'
      ) {
        logger.log('[ROUTER]: Redirecting to home from auth page');
        router.replace('/');
        return;
      }
    }

    if (!transition) {
      logger.log('[ROUTER]: No transition', method, href);
      
      router[method](href);
      return;
    }
    
    if (!appTransitionRef.current) {
      logger.log('[ROUTER]: No app transition', method, href);

      router[method](href);
      return;
    }

    if (!pageTransitionRef.current) {
      logger.log('[ROUTER]: No page transition', method, href);
      
      router[method](href);
      return;
    }

    try {
      transitioningRef.current = true;
      setBusy(1000);

      let transitionCurrent = null;

      const isCurrentLogout = path.startsWith('/logout');
      const isTargetLogout = href.startsWith('/logout');

      const isCurrentAdmin = path.startsWith('/admin');
      const isTargetAdmin = href.startsWith('/admin');

      const appChanged = (isCurrentLogout != isTargetLogout) || (isCurrentAdmin != isTargetAdmin);

      if (appChanged) {
        logger.log('[ROUTER]: Starting App transition');
        transitionCurrent = appTransitionRef;
      } else {
        logger.log('[ROUTER]: Starting Page transition');
        transitionCurrent = pageTransitionRef;
      }

      if (!transitionCurrent || !transitionCurrent.current) {
        logger.log('[ROUTER]: No transitionCurrent', method, href);
        
        router[method](href);
        return;
      }

      logger.log('[ROUTER]: Starting transition');
      await transitionCurrent.current.transitionOut();

      logger.log('[ROUTER]: Navigating to', href);
      router[method](href);

      logger.log('[ROUTER]: Waiting for content to mount');
      await transitionCurrent.current.waitForContent();

      if (href.startsWith('/logout')) {
        return;
      }

      logger.log('[ROUTER]: Content ready, fading in app');
      await transitionCurrent.current.transitionIn();
    } finally {
      transitioningRef.current = false;
      setBusy(false);
    }
  };

  return {
    push: (h: string, t?: boolean) => navigate(h, 'push', t),
    replace: (h: string, t?: boolean) => navigate(h, 'replace', t),
  };
}
