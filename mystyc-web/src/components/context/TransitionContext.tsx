'use client';

import { createContext, useContext, useRef, useMemo, ReactNode } from 'react';
import type { TransitionRef } from '@/components/transition/Transition';

interface RefHandles {
  stateTransitionRef: React.MutableRefObject<TransitionRef | null>;
  pageTransitionRef:  React.MutableRefObject<TransitionRef | null>;
}

const TransitionContext = createContext<RefHandles>(null!);

export function TransitionProvider({ children }: { children: ReactNode }) {
  const stateTransitionRef = useRef<TransitionRef>(null);
  const pageTransitionRef  = useRef<TransitionRef>(null);

  // memo the refs object so its identity never changes
  const refs = useMemo(
    () => ({ stateTransitionRef, pageTransitionRef }),
    []
  );

  return (
    <TransitionContext.Provider value={refs}>
      {children}
    </TransitionContext.Provider>
  );
}

export function useTransitions() {
  return useContext(TransitionContext);
}
