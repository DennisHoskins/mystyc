import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppState {
  // App state
  isOnline: boolean;
  isGlobalError: boolean;
  isBusy: boolean;
  busyTimer: ReturnType<typeof setTimeout> | null;
  toasts: { id: string; message: string; type: 'success' | 'error' | 'info'; timestamp: number }[];
  hasHydrated: boolean;

  // Modal state
  isModalShowing: boolean;

  // Admin state
  sidebarCollapsed: boolean;

  // Actions
  setOnline: (isOnline: boolean) => void;
  setGlobalError: (isGlobalError: boolean) => void;
  setBusy: (delayMs?: number) => void;
  clearBusy: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: (id: string) => void;
  setHasHydrated: (isHydrated: boolean) => void;
  clearAppState: () => void;

  // Modal actions
  setModalShowing: (isModalShowing: boolean) => void;

  // Admin actions
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const initialState = {
  // App initial state
  isOnline: true,
  isBusy: false,
  isGlobalError: false,
  busyTimer: null,
  toasts: [],
  hasHydrated: false,

  // Modal initial state
  isModalShowing: false,

  // Admin initial state
  sidebarCollapsed: false,
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
      showToast: (message, type = 'info') => {
        const toast = { id: Math.random().toString(36).slice(2, 11), message, type, timestamp: Date.now() };
        set((state) => ({ toasts: [...state.toasts, toast] }));
        setTimeout(() => get().hideToast(toast.id), 5000);
      },
      hideToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
      clearAppState: () => {
        const state = get();
        if (state.busyTimer) clearTimeout(state.busyTimer);
        set(initialState as any);
      },
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),

      // Modal actions
      setModalShowing: (isModalShowing) => set({ isModalShowing }),

      // Admin actions
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({ 
        sidebarCollapsed: state.sidebarCollapsed,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      }      
    }
  )
);