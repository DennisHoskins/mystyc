'use client';

import { createContext, useContext, ReactNode } from 'react';

interface TransitionContextType {
  isTransitioning: boolean;
  startTransition: (callback?: () => void) => void;
  onTransitionComplete: (callback: () => void) => void;
}

const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

export const useTransition = () => {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error('useTransition must be used within a Transition component');
  }
  return context;
};

interface TransitionProps {
  children: ReactNode;
}

export default function Transition({ children }: TransitionProps) {
  // Pass-through implementation - fulfills contract but does nothing visually
  const startTransition = (callback?: () => void) => {
    // For now, just call callback immediately (no visual transition)
    if (callback) callback();
  };
  
  const onTransitionComplete = (callback: () => void) => {
    // For now, call immediately since there's no transition
    callback();
  };
  
  return (
    <TransitionContext.Provider value={{ 
      isTransitioning: false, 
      startTransition, 
      onTransitionComplete 
    }}>
      {children}
    </TransitionContext.Provider>
  );
}