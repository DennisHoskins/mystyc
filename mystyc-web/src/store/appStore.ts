import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppState {
  // App state
  isOnline: boolean;
  isBusy: boolean;
  isGlobalError: boolean;
  isLoggedOut: boolean;
  isLoggedOutByServer: boolean;
  busyTimer: NodeJS.Timeout | null;
  toasts: { id: string; message: string; type: 'success' | 'error' | 'info'; timestamp: number }[];
  
  // FCM state
  fcmToken: string | null;
  lastTokenUpdate: number | null;

  // Actions
  setOnline: (isOnline: boolean) => void;
  setBusy: (delayMs?: number) => void;
  clearBusy: () => void;
  setGlobalError: (isGlobalError: boolean) => void;
  setLoggedOut: (isLoggedOut: boolean) => void;
  setLoggedOutByServer: (isLoggedOutByServer: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: (id: string) => void;
  clearAppState: () => void;
  
  // FCM actions
  setFcmToken: (token: string | null) => void;
  clearFcmToken: () => void;
}

const initialState = {
  isOnline: true,
  isBusy: false,
  isGlobalError: false,
  isLoggedOut: false,
  isLoggedOutByServer: false,
  busyTimer: null,
  toasts: [],
  
  // FCM initial state
  fcmToken: null,
  lastTokenUpdate: null,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setOnline: (isOnline) => set({ isOnline }),
      setBusy: (delayMs) => {
        const state = get();
        if (state.busyTimer) clearTimeout(state.busyTimer);
        if (!delayMs) {
          set({ isBusy: true, busyTimer: null });
        } else {
          const timer = setTimeout(() => set({ isBusy: true, busyTimer: null }), delayMs);
          set({ busyTimer: timer });
        }
      },
      clearBusy: () => {
        const state = get();
        if (state.busyTimer) clearTimeout(state.busyTimer);
        set({ isBusy: false, busyTimer: null });
      },
      setGlobalError: (isGlobalError) => set({ isGlobalError }),
      setLoggedOut: (isLoggedOut) => set({ isLoggedOut }),
      setLoggedOutByServer: (isLoggedOutByServer) => set({ isLoggedOutByServer }),
      showToast: (message, type = 'info') => {
        const toast = { id: Math.random().toString(36).substr(2, 9), message, type, timestamp: Date.now() };
        set((state) => ({ toasts: [...state.toasts, toast] }));
        setTimeout(() => get().hideToast(toast.id), 5000);
      },
      hideToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
      clearAppState: () => {
        const state = get();
        if (state.busyTimer) clearTimeout(state.busyTimer);
        set(initialState as any);
      },
      
      // FCM actions
      setFcmToken: (token) => set({ fcmToken: token, lastTokenUpdate: Date.now() }),
      clearFcmToken: () => set({ fcmToken: null, lastTokenUpdate: null }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({ 
        fcmToken: state.fcmToken, 
        lastTokenUpdate: state.lastTokenUpdate 
      })
    }
  )
);