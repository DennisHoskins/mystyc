'use client';

import { useRouter, usePathname } from 'next/navigation';

import { useTransitions } from '@/components/context/TransitionContext';
import { useUser } from '@/components/context/AppContext';
import { useAppStore } from '@/store/appStore';
import { logger } from '@/util/logger';

export function useTransitionRouter() {
  const router = useRouter();
  const path = usePathname();
  const user = useUser();
  const { pageTransitionRef } = useTransitions();

  const isStateT = useAppStore((s) => s.isStateTransitioning);

  const navigate = async (
    href: string,
    method: 'push' | 'replace',
    transition = true
  ) => {
    if (href === path) {
      logger.log('[ROUTER]: Skipping transition for same path');
      return;
    } 

    if (href === '/logout' || path === '/logout') {
      logger.log('[ROUTER]: Skipping transition for logout');
      router[method](href);
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

    if (!transition) {
      logger.log('[ROUTER]: No transition', method, href);
      router[method](href);
      return;
    }

    if (isStateT) {
      logger.log('[ROUTER]: State transition in progress, skipping navigation');
      return;
    }

    logger.log('[ROUTER]: out', path, href);
    await pageTransitionRef.current?.transitionOut();
    router[method](href);
  };

  return {
    push: (h: string, t?: boolean) => navigate(h, 'push', t),
    replace: (h: string, t?: boolean) => navigate(h, 'replace', t),
  };
}
