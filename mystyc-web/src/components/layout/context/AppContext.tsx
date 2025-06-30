'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useStore } from 'zustand';

import { apiClient } from '@/api/apiClient';
import { createUserStore, UserState } from '@/store/userStore';
import { useAppStore } from '@/store/appStore';

import Layout from '@/components/layout/Layout';
import Working from '@/components/ui/working/Working';
import Toast from '@/components/ui/toast/Toast';

const UserStoreContext = createContext<ReturnType<typeof createUserStore> | null>(null);

interface AppContextProps {
  children: React.ReactNode;
}

export default function AppContext({ children }: AppContextProps) {
  const [loading, setLoading] = useState(true);
  const storeRef = useRef<ReturnType<typeof createUserStore> | null>(null);
  if (!storeRef.current) {
    storeRef.current = createUserStore(null);
  }

  useEffect(() => {
    const getServerUser = async () => {
      if (document.readyState !== 'complete') {
        await new Promise(resolve => window.addEventListener('load', resolve));
      }      
      
      const user = await apiClient.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      storeRef.current = createUserStore(user);
      setLoading(false);
    }

    getServerUser();
  }, [])

  const hasHydrated = useAppStore((state) => state.hasHydrated);  
  if (!hasHydrated) {
    return null
  }  

  if (loading) {
    return;
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

export const useAuthenticated = () => {
  const store = useContext(UserStoreContext);
  if (!store) throw new Error('useAuthenticated must be used within UserStoreProvider');
  return useStore(store, (state: UserState) => state.authenticated);
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
  return useStore(store, (state: UserState) => state.setUser);
};

export const useClearUser = () => {
  const store = useContext(UserStoreContext);
  if (!store) throw new Error('useClearUser must be used within UserStoreProvider');
  return useStore(store, (state: UserState) => state.clearUser);
};

export const useSetAuthenticated = () => {
  const store = useContext(UserStoreContext);
  if (!store) throw new Error('useSetAuthenticated must be used within UserStoreProvider');
  return useStore(store, (state: UserState) => state.setAuthenticated);
};

export const useBusy = () => {
  const setBusyStore = useAppStore((state) => state.setBusy);
  const clearBusy = useAppStore((state) => state.clearBusy);
  const isBusy = useAppStore((state) => state.isBusy);

  const setBusy = (state: boolean | number = true) => {
    if (state === false) {
      clearBusy();
    } else if (state === true) {
      setBusyStore();
    } else {
      setBusyStore(state);
    }
  };

  return {
    isBusy,
    setBusy
  };
};

export const useToast = () => {
  return useAppStore((state) => state.showToast);
};