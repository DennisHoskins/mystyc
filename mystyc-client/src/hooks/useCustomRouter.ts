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
    logger.log(`[CustomRouter] ${method}: ${href}`);
    
    if (href === pathname) {
      logger.log('[CustomRouter] Already on this path, ignoring');
      return;
    }

    if (!isReady) {
      logger.log('[CustomRouter] Navigation in progress, ignoring');
      return;
    }
    
    try {
      transition.startTransitionOut(() => {
        logger.log('[CustomRouter] Transition out complete, navigating');
        setIsReady(false);
        
        try {
          router[method](href);
          
          // Timeout fallback - if navigation doesn't complete in 5 seconds
          setTimeout(() => {
            if (!isReady) {
              logger.error('[CustomRouter] Navigation timeout, forcing clear');
              setIsReady(true);
            }
          }, 5000);
          
        } catch (err) {
          logger.error('[CustomRouter] Router navigation failed:', err);
          setIsReady(true);
        }
      });

      // Timeout for transition callbacks - if startTransitionOut callback never fires
      setTimeout(() => {
        if (!isReady) {
          logger.error('[CustomRouter] Transition callback timeout, forcing clear');
          setIsReady(true);
        }
      }, 3000);

    } catch (err) {
      logger.error('[CustomRouter] Transition start failed:', err);
      setIsReady(true);
    }

    transition.onTransitionComplete(() => {
      logger.log('[CustomRouter] Transition complete, router ready');
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