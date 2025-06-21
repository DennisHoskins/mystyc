'use client';

import {
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import Transition, { TransitionRef } from './Transition';
import { useTransitions } from '@/components/context/TransitionContext';
import { logger } from '@/util/logger';

export interface PageTransitionRef extends TransitionRef {
  waitForContent: () => Promise<void>;
}

export default function PageTransition({ 
  pathname, 
  children 
}: { 
  pathname: string; 
  children: ReactNode;
}) {
  const { pageTransitionRef } = useTransitions();
  const transitionRef = useRef<TransitionRef>(null);
  const [currentChildren, setCurrentChildren] = useState(children);
  const contentPromiseRef = useRef<{
    resolve: () => void;
    promise: Promise<void>;
  } | null>(null);

  useEffect(() => {
    logger.log('[PAGE TRANSITION] pathname', pathname);
  }, [pathname]);

  useEffect(() => {
    logger.log('[PAGE TRANSITION] useEffect - children changed?', children !== currentChildren);
    if (children !== currentChildren) {
      if (contentPromiseRef.current) {
        logger.log('[PAGE TRANSITION] new content detected');
        contentPromiseRef.current.resolve();
        contentPromiseRef.current = null;
      }
      setCurrentChildren(children);
    }
  }, [children, currentChildren]);

  useEffect(() => {
    return () => {
      if (contentPromiseRef.current) {
        logger.log('[PAGE TRANSITION] cleanup - resolving pending promise');
        contentPromiseRef.current.resolve();
        contentPromiseRef.current = null;
      }
    };
  }, []);

  useImperativeHandle(pageTransitionRef, () => ({
    transitionOut: async () => {
      logger.log('[PAGE TRANSITION] out');
      return transitionRef.current?.transitionOut();
    },
    transitionIn: async () => {
      logger.log('[PAGE TRANSITION] in');
      return transitionRef.current?.transitionIn();
    },
    waitForContent: () => {
      logger.log('[PAGE TRANSITION] waiting for content');
      
      if (children !== currentChildren) {
        logger.log('[PAGE TRANSITION] content already changed, resolving immediately');
        setCurrentChildren(children);
        return Promise.resolve();
      }
      
      const promise = new Promise<void>((resolve) => {
        contentPromiseRef.current = { resolve, promise: null! };
      });
      contentPromiseRef.current!.promise = promise;
      return promise;
    }
  }));

  return (
    <Transition ref={transitionRef} transition="transition-page">
      {children}
    </Transition>
  );
}