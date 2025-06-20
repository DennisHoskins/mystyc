'use client';

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import Transition, { TransitionRef } from './Transition';
import { useTransitions } from '@/components/context/TransitionContext';
import { useAppStore } from '@/store/appStore';
import { logger } from '@/util/logger';

export type PageTransitionRef = TransitionRef;

const PageTransition = forwardRef<PageTransitionRef, { children: ReactNode }>(
  ({ children }, ref) => {
    const { pageTransitionRef } = useTransitions();
    const transitionRef = useRef<TransitionRef>(null);
    const path = usePathname();
    const setPageTransitioning = useAppStore((s) => s.setPageTransitioning);
    const isPageTransitioning = useAppStore((s) => s.isPageTransitioning);

    const transitionOut = async (): Promise<void> => {
      logger.log('[PAGE TRANSITION] out');
      await transitionRef.current?.transitionOut();
      setPageTransitioning(true);
    };

    useImperativeHandle(ref, () => ({
      transitionOut,
      transitionIn: transitionRef.current!.transitionIn,
    }));
    useImperativeHandle(pageTransitionRef, () => ({
      transitionOut,
      transitionIn: transitionRef.current!.transitionIn,
    }));

    useEffect(() => {
      if (!isPageTransitioning) {
        return;
      }

      if (!transitionRef.current) {
        logger.error('[PAGE TRANSITION] transitionRef is null');  
        return;
      } 

      logger.log('[PAGE TRANSITION] in');
      transitionRef.current
        .transitionIn()
        .then(() => setPageTransitioning(false));
    }, [isPageTransitioning, setPageTransitioning]);

    return (
      <Transition key={path} ref={transitionRef} transition="transition-page">
        {children}
      </Transition>
    );
  }
);

PageTransition.displayName = 'PageTransition';
export default PageTransition;
