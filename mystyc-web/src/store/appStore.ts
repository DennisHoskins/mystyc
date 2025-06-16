import { create } from 'zustand';

export interface AppState {
  // State
  isOnline: boolean;
  isBusy: boolean;
  isGlobalError: boolean;
  isLoggedOutByServer: boolean;

  // Actions
  setOnline: (isOnline: boolean) => void;
  setBusy: (isBusy: boolean) => void;
  setGlobalError: (isGlobalError: boolean) => void;
  setLoggedOutByServer: (isLoggedOutByServer: boolean) => void;
  clearAppState: () => void;
}

const initialState = {
  isOnline: true,
  isBusy: false,
  isGlobalError: false,
  isLoggedOutByServer: false,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  // Actions
  setOnline: (isOnline: boolean) => set({ isOnline }),
  setBusy: (isBusy: boolean) => set({ isBusy }),
  setGlobalError: (isGlobalError: boolean) => set({ isGlobalError }),
  setLoggedOutByServer: (isLoggedOutByServer: boolean) => set({ isLoggedOutByServer }),
  clearAppState: () => set(initialState),
}));