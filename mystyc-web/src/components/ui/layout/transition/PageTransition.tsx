'use client';

import {
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
  ReactNode,
} from 'react';

import { useUser } from '@/components/ui/layout/context/AppContext';
import { useTransitions } from '@/components/ui/layout/context/TransitionContext';
import { logger } from '@/util/logger';

import Transition, { TransitionRef } from './Transition';

export interface PageTransitionRef extends TransitionRef {
  waitForContent: () => Promise<void>;
}

export default function PageTransition({ children }: { children: ReactNode }) {
  const user = useUser();
  const { pageTransitionRef, isAppTransitioning, startPageTransition, endPageTransition } = useTransitions();
  const transitionRef = useRef<TransitionRef>(null);
  const [currentChildren, setCurrentChildren] = useState(children);
  const isFirstRender = useRef(true);
  const isWebsite = !user;
  const prevIsWebsite = useRef(isWebsite);
  const contentPromiseRef = useRef<{ resolve: () => void; promise?: Promise<void>; } | null>(null);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevIsWebsite.current = isWebsite;
      return;
    }

    if (children !== currentChildren) {
      if (contentPromiseRef.current) {
        contentPromiseRef.current.resolve();
        contentPromiseRef.current = null;
      }
      setCurrentChildren(children);
    }

    if (isWebsite !== prevIsWebsite.current) {
      prevIsWebsite.current = isWebsite;
    }
  }, [children, currentChildren, isWebsite]);

  useEffect(() => {
    return () => {
      if (contentPromiseRef.current) {
        contentPromiseRef.current.resolve();
        contentPromiseRef.current = null;
      }
    };
  }, []);

  useImperativeHandle(pageTransitionRef, () => ({
    transitionOut: async () => {
      if (isAppTransitioning) {
        logger.log('[PAGE TRANSITION] skipping transitionOut due to appTransition');
        return Promise.resolve();
      }
      startPageTransition();
      logger.log('[PAGE TRANSITION] out');
      return transitionRef.current?.transitionOut();
    },
    transitionIn: async () => {
      if (isAppTransitioning) {
        logger.log('[PAGE TRANSITION] skipping transitionIn due to appTransition');
        return Promise.resolve();
      }
      logger.log('[PAGE TRANSITION] in');
      const result = transitionRef.current?.transitionIn();
      endPageTransition();
      return result;
    },
    waitForContent: () => {
      logger.log('[PAGE TRANSITION] waiting for content');
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
    <div className="flex flex-col flex-1 transition-all duration-300 ease-in-out">
      <Transition ref={transitionRef} transition="transition-page">
        {currentChildren}
      </Transition>
    </div>
  );
}
