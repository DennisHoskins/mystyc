'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

import { App } from '@/interfaces/app.interface';

interface AppContextType {
  app: App | null;
  setApp: (app: App) => void;
}

const AppContext = createContext<AppContextType>({
  app: { authToken: null, user: null, fcmToken: null },
  setApp: () => {},
});

interface AppProviderProps {
  app: App | null;
  children: ReactNode;
}

export function AppProvider({ app, children }: AppProviderProps) {
  const [thisApp, setApp] = useState<App>(app || { authToken: null, user: null, fcmToken: null });

  const value = {
    app: thisApp,
    setApp: setApp,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};