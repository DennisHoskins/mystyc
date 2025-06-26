'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useBusy, useUser } from '@/components/layout/context/AppContext';
import { useTransitions } from '@/components/layout/context/TransitionContext';
import { logger } from '@/util/logger';
import { useRef } from 'react';

export function useTransitionRouter() {
  const router = useRouter();
  const path = usePathname();
  const user = useUser();
  const { pageTransitionRef } = useTransitions();
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
      if (href == "/login" || path == "/login" || 
          href == "register" || path == "/register" || 
          href == "/password-reset" || path == "/password-reset") {
        logger.log('[ROUTER]: Redirecting to home from auth page');
        router.replace("/");
        return;
      }
    }

    if (!transition || !pageTransitionRef.current) {
      logger.log('[ROUTER]: No transition', method, href);
      router[method](href);
      return;
    }

    try {
      transitioningRef.current = true;
      setBusy(500);

      logger.log('[ROUTER]: Starting transition out', path, href);
      await pageTransitionRef.current.transitionOut();
      
      logger.log('[ROUTER]: Navigating to', href);
      router[method](href);
      
      logger.log('[ROUTER]: Waiting for content to mount');
      await pageTransitionRef.current.waitForContent();
      
      logger.log('[ROUTER]: Content ready, fading in');
      await pageTransitionRef.current.transitionIn();
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