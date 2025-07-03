'use client';

import React, { createContext, useContext, useState, useRef, createRef, ReactNode } from 'react';

import type { AppTransitionRef } from '@/components/layout/transition/AppTransition';
import type { PageTransitionRef } from '@/components/layout/transition/PageTransition';

interface TransitionContextType {
  isAppTransitioning: boolean;
  isPageTransitioning: boolean;
  appTransitionRef: React.RefObject<AppTransitionRef | null>;
  pageTransitionRef: React.RefObject<PageTransitionRef | null>;
  startAppTransition: () => void;
  endAppTransition: () => void;
  startPageTransition: () => void;
  endPageTransition: () => void;
}

const TransitionContext = createContext<TransitionContextType>({
  isAppTransitioning: false,
  isPageTransitioning: false,
  appTransitionRef: createRef<AppTransitionRef | null>(),
  pageTransitionRef: createRef<PageTransitionRef | null>(),
  startAppTransition: () => {},
  endAppTransition: () => {},
  startPageTransition: () => {},
  endPageTransition: () => {},
});

export function TransitionProvider({ children }: { children: ReactNode }) {
  const [isAppTransitioning, setIsAppTransitioning] = useState(false);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const appTransitionRef = useRef<AppTransitionRef | null>(null);
  const pageTransitionRef = useRef<PageTransitionRef | null>(null);

  const startAppTransition = () => setIsAppTransitioning(true);
  const endAppTransition = () => setIsAppTransitioning(false);

  const startPageTransition = () => setIsPageTransitioning(true);
  const endPageTransition = () => setIsPageTransitioning(false);

  return (
    <TransitionContext.Provider
      value={{
        isAppTransitioning,
        isPageTransitioning,
        appTransitionRef,
        pageTransitionRef,
        startAppTransition,
        endAppTransition,
        startPageTransition,
        endPageTransition,
      }}
    >
      {children}
    </TransitionContext.Provider>
  );
}

export function useTransitions() {
  return useContext(TransitionContext);
}
