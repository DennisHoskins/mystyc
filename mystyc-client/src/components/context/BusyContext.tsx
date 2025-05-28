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
  setBusy: (state: boolean, delayMs?: number) => void;
};

const BusyContext = createContext<BusyContextType | undefined>(undefined);

export function BusyProvider({ children }: { children: ReactNode }) {
  const [busy, setBusy] = useState(false);
  const [delayMs, setDelayMs] = useState(500);

  const setBusyWithDelay = useCallback((state: boolean, delay: number = 1000) => {
    logger.log('[BusyProvider] setBusy:', state, 'delay:', delay);
    
    if (state && busy) {
      logger.log('[BusyProvider] Already busy, ignoring');
      return;
    }
    
    setBusy(state);
    setDelayMs(delay);
  }, [busy]);

  return (
    <BusyContext.Provider value={{ setBusy: setBusyWithDelay }}>
      <Working show={busy} delayMs={delayMs} />
      {children}
    </BusyContext.Provider>
  );
}

export function useBusy() {
  const context = useContext(BusyContext);
  if (!context) throw new Error('useBusy must be used within BusyProvider');
  return context;
}