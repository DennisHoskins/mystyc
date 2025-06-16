import { create } from 'zustand';

export interface AppState {
  // State
  isOnline: boolean;
  isBusy: boolean;
  isGlobalError: boolean;
  isLoggedOutByServer: boolean;
  busyTimer: NodeJS.Timeout | null;

  // Actions
  setOnline: (isOnline: boolean) => void;
  setBusy: (delayMs?: number) => void;
  clearBusy: () => void;
  setGlobalError: (isGlobalError: boolean) => void;
  setLoggedOutByServer: (isLoggedOutByServer: boolean) => void;
  clearAppState: () => void;
}

const initialState = {
  isOnline: true,
  isBusy: false,
  isGlobalError: false,
  isLoggedOutByServer: false,
  busyTimer: null,
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
  setLoggedOutByServer: (isLoggedOutByServer: boolean) => set({ isLoggedOutByServer }),
  
  clearAppState: () => {
    const state = get();
    
    // Clear any existing timer before resetting
    if (state.busyTimer) {
      clearTimeout(state.busyTimer);
    }
    
    set(initialState);
  },
}));