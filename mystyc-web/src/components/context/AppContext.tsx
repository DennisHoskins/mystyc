'use client';

import { useState, useEffect, useCallback } from 'react'

import { createContext, useContext, ReactNode } from 'react';
import { App } from '@/interfaces/app.interface';
import { AppUser } from '@/interfaces/appUser.interface';
import { User } from '@/interfaces/user.interface';
import { useBusy } from '@/components/context/BusyContext';

interface AppContextType {
  app: App | null;
  setApp: (app: App | null) => void;
  setUser: (user: User | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
  user?: User | null;
}

const transformUserToAppUser = (user: User): AppUser => ({
  ...user,
  isAdmin: user.userProfile.roles.includes("admin"),
  isOnboard: user.userProfile.zodiacSign != null
});

export function AppProvider({ children, user }: AppProviderProps) {
  const [app, setApp] = useState<App | null>(null);
  const { setBusy } = useBusy();

  const handleSetUser = useCallback((user: User | null | undefined) => {
    const appUser = user ? transformUserToAppUser(user) : null;
    setApp(prev => prev ? { ...prev, user: appUser } : appUser ? { user: appUser } : null);
  }, []);

  useEffect(() => {
    // Set busy during hydration
    setBusy(true);
    
    // Set initial user from server
    handleSetUser(user);
    
    // Mark hydration complete
    setBusy(false);
  }, [user, handleSetUser, setBusy]);

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