'use client';

import { createContext, useContext, useRef } from 'react';
import { useStore } from 'zustand';
import { ServerUser } from '@/server/getUser';
import { createUserStore, UserState } from '@/store/userStore';
import { BusyProvider } from '@/components/context/BusyContext';
import Transition from '@/components/Transition';
import LayoutManager from '@/components/layout/LayoutManager';

console.log("UserStoreContext")
const UserStoreContext = createContext<ReturnType<typeof createUserStore> | null>(null);

interface AppContextProps {
  children: React.ReactNode;
  user: ServerUser | null;
}

export default function AppContext({ children, user }: AppContextProps) {
  const storeRef = useRef<ReturnType<typeof createUserStore> | null>(null);

  console.log("AppContext")
  
  if (!storeRef.current) {
    storeRef.current = createUserStore(user);
  }
  
  return (
    <UserStoreContext.Provider value={storeRef.current}>
      <BusyProvider>
        <Transition>
          <LayoutManager>
            {children}
          </LayoutManager>
        </Transition>
      </BusyProvider>
    </UserStoreContext.Provider>
  );
}

// Export the hooks with proper typing
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