'use client';

import { 
  createContext, 
  useContext, 
  useRef, 
  useMemo, 
  RefObject,
  ReactNode 
} from 'react';

import { PageTransitionRef } from '@/components/layout/transition/PageTransition';

interface TransitionContextType {
  pageTransitionRef: RefObject<PageTransitionRef | null>;
}

const TransitionContext = createContext<TransitionContextType>(null!);

export function TransitionProvider({ children }: { children: ReactNode }) {
  const pageTransitionRef = useRef<PageTransitionRef>(null);

  const value = useMemo(() => ({ 
    pageTransitionRef,
  }), []);

  return (
    <TransitionContext.Provider value={value}>
      {children}
    </TransitionContext.Provider>
  );
}

export function useTransitions() {
  return useContext(TransitionContext);
}