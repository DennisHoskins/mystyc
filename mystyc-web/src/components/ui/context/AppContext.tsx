'use client'

import { createContext, useContext, useRef, useCallback, useEffect } from 'react';
import { useStore } from 'zustand';

import { useAppStore } from '@/store/appStore';
import { createUserStore, UserState } from '@/store/userStore';
import Layout from '@/components/ui/layout/Layout';
import Working from '@/components/ui/working/Working';
import Toast from '@/components/ui/toast/Toast';

const UserStoreContext = createContext<ReturnType<typeof createUserStore> | null>(null);

interface AppContextProps {
  children: React.ReactNode;
}

export default function AppContext({ children }: AppContextProps) {
  const storeRef = useRef<ReturnType<typeof createUserStore>>(createUserStore(null));
  const hasHydrated = useAppStore((state) => state.hasHydrated);

  useEffect(() => {
    // Get setOnline inside useEffect to avoid subscription
    const { setOnline } = useAppStore.getState();
    
    const handleOnline = () => {
      setOnline(true);
    };
    const handleOffline = () => {
      setOnline(false);
    };
    setOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  if (!hasHydrated) {
    return null
  }  

  return (
    <UserStoreContext.Provider value={storeRef.current}>
      <Layout>
        {children}
      </Layout>
      <Working />
      <Toast />
    </UserStoreContext.Provider>
  );
}

// Export hooks with proper typing
export const useUser = () => {
  const store = useContext(UserStoreContext);
  if (!store) throw new Error('useUser must be used within UserStoreProvider');
  return useStore(store, (state: UserState) => state.user);
};

export const useUserProfile = () => {
  const store = useContext(UserStoreContext);
  if (!store) throw new Error('useUserProfile must be used within UserStoreProvider');
  return useStore(store, (state: UserState) => state.user?.userProfile || null);
};

export const useIsLoggedIn = () => {
  const store = useContext(UserStoreContext);
  if (!store) throw new Error('useIsLoggedIn must be used within UserStoreProvider');
  return useStore(store, (state: UserState) => !!state.user);
};

export const useInitialized = () => {
  const store = useContext(UserStoreContext);
  if (!store) throw new Error('useInitialized must be used within UserStoreProvider');
  return useStore(store, (state: UserState) => state.initialized);
};

export const useSetUser = () => {
  const store = useContext(UserStoreContext);
  if (!store) throw new Error('useSetUser must be used within UserStoreProvider');
  
  const selector = useCallback((state: UserState) => state.setUser, []);
  return useStore(store, selector);
};

export const useClearUser = () => {
  const store = useContext(UserStoreContext);
  if (!store) throw new Error('useClearUser must be used within UserStoreProvider');
  
  const selector = useCallback((state: UserState) => state.clearUser, []);
  return useStore(store, selector);
};

export const useBusy = () => {
  const setBusyStore = useAppStore((state) => state.setBusy);
  const clearBusy = useAppStore((state) => state.clearBusy);
  const isBusy = useAppStore((state) => state.isBusy);

  const setBusy = useCallback((state: boolean | number = true) => {
    if (state === false) {
      clearBusy();
    } else if (state === true) {
      setBusyStore();
    } else {
      setBusyStore(state);
    }
  }, [setBusyStore, clearBusy]);

  return {
    isBusy,
    setBusy
  };
};

export const useToast = () => {
  return useAppStore((state) => state.showToast);
};