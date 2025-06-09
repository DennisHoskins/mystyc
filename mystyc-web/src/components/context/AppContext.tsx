'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { App } from '@/interfaces/app.interface';

interface AppContextType {
  app: App | null;
  setApp: (app: App | null) => void;
  deviceId: string | null;
  setDeviceId: (deviceId: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ 
  app,
  deviceId, 
  children 
}: { 
  app: App | null; 
  deviceId: string | null; 
  children: ReactNode 
}) {
  const [thisApp, setApp] = useState<App | null>(app);
  const [thisDeviceId, setDeviceId] = useState<string | null>(deviceId);

  useEffect(() => {
    setApp(app);
  }, [app]);

  useEffect(() => {
    setDeviceId(deviceId);
  }, [deviceId]);

  return (
    <AppContext.Provider value={{ 
      app: thisApp, setApp,
      deviceId: thisDeviceId, setDeviceId 
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
