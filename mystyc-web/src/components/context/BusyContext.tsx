'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';

import { logger } from '@/util/logger';

import Working from '@/components/ui/Working';

type BusyContextType = {
  isBusy: boolean;
  setBusy: (state: boolean, delayMs?: number) => void;
};

const BusyContext = createContext<BusyContextType | undefined>(undefined);

export function BusyProvider({ children }: { children: ReactNode }) {
  const [busy, setBusy] = useState(false);
  const [delayMs, setDelayMs] = useState(500);

  const setBusyWithDelay = useCallback((state: boolean, delay: number = 1000) => {
    logger.log('[BusyProvider] setBusy:', state, 'delay:', delay);
    
    setBusy(currentBusy => {
      if (state && currentBusy) {
        logger.log('[BusyProvider] Already busy, ignoring');
        return currentBusy;
      }
      
      // Only update delay when state actually changes
      if (state !== currentBusy) {
        setDelayMs(delay);
      }
      
      return state;
    });
  }, []);

  return (
    <BusyContext.Provider value={{ isBusy: busy, setBusy: setBusyWithDelay }}>
      <Working show={busy} delayMs={delayMs} />
      {children}
    </BusyContext.Provider>
  );
}

export function useBusy() {
  const context = useContext(BusyContext);
  if (!context) throw new Error('useBusy must be used within BusyProvider');
  return {
    isBusy: context.isBusy,
    setBusy: context.setBusy
  };
}