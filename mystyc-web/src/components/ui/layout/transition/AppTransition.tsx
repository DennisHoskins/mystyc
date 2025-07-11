'use client';

import {
  useImperativeHandle,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';

import { useTransitions } from '@/components/ui/layout/context/TransitionContext';
import { logger } from '@/util/logger';

import Transition, { TransitionRef } from './Transition';

export interface AppTransitionRef extends TransitionRef {
  waitForContent: () => Promise<void>;
}

export default function AppTransition({ children }: { children: ReactNode }) {
  const {
    appTransitionRef,
    isAppTransitioning,
    startAppTransition,
    endAppTransition,
  } = useTransitions();
  const transitionRef = useRef<TransitionRef>(null);
  const isFirstRender = useRef(true);

  const contentPromiseRef = useRef<{ resolve: () => void; promise?: Promise<void>; } | null>(null);

  const [currentChildren, setCurrentChildren] = useState(children);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (children !== currentChildren) {
      if (contentPromiseRef.current) {
        contentPromiseRef.current.resolve();
        contentPromiseRef.current = null;
      }
      setCurrentChildren(children);
    }

  }, [children, currentChildren]);

  useEffect(() => {
    return () => {
      if (contentPromiseRef.current) {
        contentPromiseRef.current.resolve();
        contentPromiseRef.current = null;
      }
    };
  }, []);

  useImperativeHandle(appTransitionRef, () => ({
    transitionOut: async () => {
      if (isAppTransitioning) {
        logger.log('[APP TRANSITION] skipping transitionOut due to appTransition');
        return Promise.resolve();
      }
      startAppTransition();
      logger.log('[APP TRANSITION] out');
      return transitionRef.current?.transitionOut();
    },
    transitionIn: async () => {
      if (!isAppTransitioning) {
        logger.log('[APP TRANSITION] skipping transitionIn due to no appTransition');
        return Promise.resolve();
      }
      
      await new Promise(resolve => setTimeout(resolve, 250));

      logger.log('[APP TRANSITION] in');
      const result = transitionRef.current?.transitionIn();
      endAppTransition();
      return result;
    },
    waitForContent: () => {
      logger.log('[APP TRANSITION] waiting for content');
      if (children !== currentChildren) {
        setCurrentChildren(children);
        return Promise.resolve();
      }
      let resolveFn!: () => void;
      const promise = new Promise<void>((resolve) => {
        resolveFn = resolve;
      });
      contentPromiseRef.current = { resolve: resolveFn, promise };
      return promise;
    },
  }));

  return (
    <Transition ref={transitionRef} transition="transition-state">
      {currentChildren}
    </Transition>
  );
}
