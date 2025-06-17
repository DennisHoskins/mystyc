import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  timestamp: number;
}

export interface AppState {
  // State
  isOnline: boolean;
  isBusy: boolean;
  isGlobalError: boolean;
  isLoggedOut: boolean;
  isLoggedOutByServer: boolean;
  busyTimer: NodeJS.Timeout | null;
  toasts: Toast[];

  // Actions
  setOnline: (isOnline: boolean) => void;
  setBusy: (delayMs?: number) => void;
  clearBusy: () => void;
  setGlobalError: (isGlobalError: boolean) => void;
  setLoggedOut: (isLogged: boolean) => void;
  setLoggedOutByServer: (isLoggedOutByServer: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: (id: string) => void;
  clearAppState: () => void;
}

const initialState = {
  isOnline: true,
  isBusy: false,
  isGlobalError: false,
  isLoggedOut: false,
  isLoggedOutByServer: false,
  busyTimer: null,
  toasts: [],
};

export const useAppStore = create<AppState>((set, get) => ({
  ...initialState,

  // Actions
  setOnline: (isOnline: boolean) => set({ isOnline }),
  
  setBusy: (delayMs?: number) => {
    const state = get();
    
    // Clear any existing timer
    if (state.busyTimer) {
      clearTimeout(state.busyTimer);
    }
    
    if (delayMs === undefined || delayMs === 0) {
      // Show immediately
      set({ isBusy: true, busyTimer: null });
    } else {
      // Set timer to show after delay
      const timer = setTimeout(() => {
        set({ isBusy: true, busyTimer: null });
      }, delayMs);
      
      set({ busyTimer: timer });
    }
  },
  
  clearBusy: () => {
    const state = get();
    
    // Clear any existing timer
    if (state.busyTimer) {
      clearTimeout(state.busyTimer);
    }
    
    set({ isBusy: false, busyTimer: null });
  },
  
  setGlobalError: (isGlobalError: boolean) => set({ isGlobalError }),
  setLoggedOut: (isLoggedOut: boolean) => set({ isLoggedOut }),
  setLoggedOutByServer: (isLoggedOutByServer: boolean) => set({ isLoggedOutByServer }),
  
  showToast: (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const toast: Toast = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: Date.now()
    };
    
    set((state) => ({
      toasts: [...state.toasts, toast]
    }));
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      get().hideToast(toast.id);
    }, 5000);
  },
  
  hideToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter(toast => toast.id !== id)
    }));
  },
  
  clearAppState: () => {
    const state = get();
    
    // Clear any existing timer before resetting
    if (state.busyTimer) {
      clearTimeout(state.busyTimer);
    }
    
    set(initialState);
  },
}));