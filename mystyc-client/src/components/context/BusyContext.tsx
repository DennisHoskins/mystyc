'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
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

  useEffect(() => {
    logger.log('[BusyProvider] mounted');
  }, []);

  useEffect(() => {
    logger.log('[BusyProvider] busy =', busy);
  }, [busy]);

  const setBusyWithDelay = (state: boolean, delay: number = 1000) => {
    if (state && busy) {
      return;
    }
    setBusy(state);
    setDelayMs(delay);
  };

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