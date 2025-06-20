import { create } from 'zustand';

export interface AppState {
  isOnline: boolean;
  isBusy: boolean;
  isGlobalError: boolean;
  isLoggedOut: boolean;
  isLoggedOutByServer: boolean;
  busyTimer: NodeJS.Timeout | null;
  toasts: { id: string; message: string; type: 'success' | 'error' | 'info'; timestamp: number }[];

  // Transition flags
  isStateTransitioning: boolean;
  isPageTransitioning: boolean;

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

  // Transition setters
  setStateTransitioning: (v: boolean) => void;
  setPageTransitioning: (v: boolean) => void;
}

const initialState = {
  isOnline: true,
  isBusy: false,
  isGlobalError: false,
  isLoggedOut: false,
  isLoggedOutByServer: false,
  busyTimer: null,
  toasts: [],

  // Transition flags
  isStateTransitioning: false,
  isPageTransitioning: false,
};

export const useAppStore = create<AppState>((set, get) => ({
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

  // Transition setters
  setStateTransitioning: (v) => set({ isStateTransitioning: v }),
  setPageTransitioning: (v) => set({ isPageTransitioning: v }),
}));
