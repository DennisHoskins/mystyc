'use client';

import { useState, createContext, useContext, useRef, ReactNode } from 'react';
import type { StateTransitionRef } from '@/components/transition/StateTransition';
import type { PageTransitionRef } from '@/components/transition/PageTransition';

interface TransitionContextValue {
  stateTransitionRef: React.RefObject<StateTransitionRef | null>;
  pageTransitionRef: React.RefObject<PageTransitionRef | null>;
  isStateTransitioning: boolean;
  setStateTransitioning: (value: boolean) => void;
}

const TransitionContext = createContext<TransitionContextValue | null>(null);

export const useTransitions = () => {
  const context = useContext(TransitionContext);
  if (!context) throw new Error('useTransitions must be used within TransitionProvider');
  return context;
};

export function TransitionProvider({ children }: { children: ReactNode }) {
  const stateTransitionRef = useRef<StateTransitionRef>(null);
  const pageTransitionRef = useRef<PageTransitionRef>(null);
  const [isStateTransitioning, setStateTransitioning] = useState(false);

  return (
    <TransitionContext.Provider value={{
      stateTransitionRef,
      pageTransitionRef,
      isStateTransitioning,
      setStateTransitioning
    }}>
      {children}
    </TransitionContext.Provider>
  );
}