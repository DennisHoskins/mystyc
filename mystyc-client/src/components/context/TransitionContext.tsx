'use client';

import { createContext, useContext, ReactNode, useRef, useState } from 'react';

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
    transitionOutCallback.current = onComplete;
    setIsTransitionRequested(true);
  };

  const onTransitionComplete = (callback: () => void) => {
    transitionCompleteCallback.current = callback;
  };

  const callTransitionOutCallback = () => {
    if (transitionOutCallback.current) {
      transitionOutCallback.current();
      transitionOutCallback.current = null;
    }
    setIsTransitionRequested(false);
  };

  const callTransitionCompleteCallback = () => {
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