'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { App } from '@/interfaces/app.interface';
import { AppUser } from '@/interfaces/appUser.interface';
import { User } from '@/interfaces/user.interface';

interface AppContextType {
  app: App | null;
  setApp: (app: App | null) => void;
  setUser: (user: User | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [app, setApp] = useState<App | null>(null);

  const transformUserToAppUser = (user: User): AppUser => ({
    ...user,
    isAdmin: user.userProfile.roles.includes("admin"),
    isOnboard: user.userProfile.zodiacSign != null
  });

  const handleSetUser = (user: User | null) => {
    const appUser = user ? transformUserToAppUser(user) : null;
    setApp(prev => prev ? { ...prev, user: appUser } : appUser ? { user: appUser } : null);
  };

  return (
    <AppContext.Provider value={{ 
      app, 
      setApp, 
      setUser: handleSetUser 
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
