'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTransition } from '@/components/context/TransitionContext';
import { useBusy } from '@/components/context/BusyContext';
import { logger } from '@/util/logger';

interface Props {
  children: React.ReactNode;
}

type TransitionState = 'idle' | 'fading-out' | 'fading-in';

export default function TransitionManager({ children }: Props) {
  const [state, setState] = useState<TransitionState>('idle');
  const [isVisible, setIsVisible] = useState(true);
  const { setBusy } = useBusy();
  const pathname = usePathname();
  const transition = useTransition();
  const currentPath = useRef(pathname);
  const waitingForRouteChange = useRef(false);

  // Listen for transition requests
  useEffect(() => {
    if (transition.isTransitionRequested) {
      logger.log('[TransitionManager] Transition requested, starting fade-out');
      setBusy(true);
      setState('fading-out');
      setIsVisible(false);
      waitingForRouteChange.current = true;

      setTimeout(() => {
        logger.log('[TransitionManager] Fade-out complete, calling router callback');
        // Call the router's navigation callback
        transition.callTransitionOutCallback();
      }, 150);
    }
  }, [transition.isTransitionRequested]);

  // Update currentPath when pathname changes
  useEffect(() => {
    const previousPath = currentPath.current;
    currentPath.current = pathname;
    logger.log(`[TransitionManager] pathname updated from ${previousPath} to: ${pathname}`);

    // If we were waiting for a route change and it happened, start fade-in
    if (waitingForRouteChange.current && pathname !== previousPath) {

      if (pathname === '/') {
        logger.log('[TransitionManager] Route change detected to root, skipping fade in');
        waitingForRouteChange.current = false;
        setIsVisible(true);
        logger.log('[TransitionManager] Calling transition complete callback');
        setState('idle');
        // Call the transition complete callback
        transition.callTransitionCompleteCallback();
        return;
      }

      logger.log('[TransitionManager] Route change detected, starting fade-in');
      waitingForRouteChange.current = false;
      setState('fading-in');
      setIsVisible(true);

      setTimeout(() => {
        logger.log('[TransitionManager] Fade-in complete, calling transition complete callback');
        setState('idle');
        // Call the transition complete callback
        transition.callTransitionCompleteCallback();
      }, 150);
    }
  }, [pathname]);

  logger.log('[TransitionManager] State:', state, 'Visible:', isVisible);

  return (
    <div className={isVisible ? 'animate-fade-in' : 'animate-fade-out'}>
      {children}
    </div>
  );
}