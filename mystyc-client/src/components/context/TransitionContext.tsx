'use client';

import { createContext, useContext, ReactNode, useRef, useState } from 'react';
import { logger } from '@/util/logger';

interface TransitionContextType {
  startTransitionOut: (onComplete: () => void) => void;
  onTransitionComplete: (callback: () => void) => void;
  isTransitionRequested: boolean;
  callTransitionOutCallback: () => void;
  callTransitionCompleteCallback: () => void;
}

const TransitionContext = createContext<TransitionContextType | null>(null);

interface Props {
  children: ReactNode;
}

export function TransitionProvider({ children }: Props) {
  const [isTransitionRequested, setIsTransitionRequested] = useState(false);
  const transitionOutCallback = useRef<(() => void) | null>(null);
  const transitionCompleteCallback = useRef<(() => void) | null>(null);

  const startTransitionOut = (onComplete: () => void) => {
    logger.log('[TransitionProvider] startTransitionOut called');
    transitionOutCallback.current = onComplete;
    setIsTransitionRequested(true);
  };

  const onTransitionComplete = (callback: () => void) => {
    logger.log('[TransitionProvider] onTransitionComplete callback registered');
    transitionCompleteCallback.current = callback;
  };

  const callTransitionOutCallback = () => {
    logger.log('[TransitionProvider] callTransitionOutCallback called');
    if (transitionOutCallback.current) {
      transitionOutCallback.current();
      transitionOutCallback.current = null;
    }
    setIsTransitionRequested(false);
  };

  const callTransitionCompleteCallback = () => {
    logger.log('[TransitionProvider] callTransitionCompleteCallback called');
    if (transitionCompleteCallback.current) {
      transitionCompleteCallback.current();
      transitionCompleteCallback.current = null;
    }
  };

  const value = {
    startTransitionOut,
    onTransitionComplete,
    isTransitionRequested,
    callTransitionOutCallback,
    callTransitionCompleteCallback
  };

  return (
    <TransitionContext.Provider value={value}>
      {children}
    </TransitionContext.Provider>
  );
}

export function useTransition(): TransitionContextType {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error('useTransition must be used within a TransitionProvider');
  }
  return context;
}