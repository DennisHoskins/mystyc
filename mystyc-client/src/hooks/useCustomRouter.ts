'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTransition } from '@/components/context/TransitionContext';
import { logger } from '@/util/logger';

export function useCustomRouter() {
  const router = useRouter();
  const pathname = usePathname();
  const transition = useTransition();
  const [isReady, setIsReady] = useState(true);

  const navigate = (method: 'push' | 'replace', href: string) => {
    logger.log(`%c[CustomRouter] ${method} called: ${href}`, 'color: red; font-weight: bold;');
    
    if (href === pathname) {
      logger.log('%c[CustomRouter] Already on this path, ignoring', 'color: red; font-weight: bold;');
      return;
    }

    if (!isReady) {
      logger.log('%c[CustomRouter] Navigation in progress, ignoring', 'color: red; font-weight: bold;');
      return;
    }

    logger.log('%c[CustomRouter] Starting transition out', 'color: red; font-weight: bold;');
    
    try {
      transition.startTransitionOut(() => {
        logger.log('%c[CustomRouter] Transition out complete, navigating', 'color: red; font-weight: bold;');
        setIsReady(false);
        
        try {
          router[method](href);
          
          // Timeout fallback - if navigation doesn't complete in 5 seconds
          setTimeout(() => {
            if (!isReady) {
              logger.error('%c[CustomRouter] Navigation timeout, forcing clear', 'color: red; font-weight: bold;');
              setIsReady(true);
            }
          }, 5000);
          
        } catch (err) {
          logger.error('%c[CustomRouter] Router navigation failed:', 'color: red; font-weight: bold;', err);
          setIsReady(true);
        }
      });

      // Timeout for transition callbacks - if startTransitionOut callback never fires
      setTimeout(() => {
        if (!isReady) {
          logger.error('%c[CustomRouter] Transition callback timeout, forcing clear', 'color: red; font-weight: bold;');
          setIsReady(true);
        }
      }, 3000);

    } catch (err) {
      logger.error('%c[CustomRouter] Transition start failed:', 'color: red; font-weight: bold;', err);
      setIsReady(true);
    }

    transition.onTransitionComplete(() => {
      logger.log('%c[CustomRouter] Transition complete, router ready', 'color: red; font-weight: bold;');
      setIsReady(true);
    });
  };

  const push = (href: string) => {
    navigate('push', href);
  };

  const replace = (href: string) => {
    navigate('replace', href);
  };

  return {
    ...router,
    push,
    replace,
  };
}