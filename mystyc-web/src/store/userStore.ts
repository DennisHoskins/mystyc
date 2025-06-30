import { create } from 'zustand';
import { User } from '@/interfaces/user.interface';
import { AppUser } from '@/interfaces/appUser.interface';
import { ServerUser } from '@/interfaces/serverUser.interface';

const transformUserToAppUser = (user: User): AppUser => ({
  ...user,
  isAdmin: user.userProfile.roles.includes("admin"),
  isOnboard: user.userProfile.zodiacSign != null
});

const getInitialState = (serverUser: ServerUser | null) => {
  if (serverUser === null) {
    return {
      user: null,
      authenticated: false,
      initialized: true
    };
  } else if (serverUser.user) {
    return {
      user: transformUserToAppUser(serverUser.user),
      authenticated: true,
      initialized: true
    };
  } else {
    return {
      user: null,
      authenticated: true,
      initialized: true
    };
  }
};

export interface UserState {
  // State
  user: AppUser | null;
  authenticated: boolean | null;
  initialized: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  clearUser: () => void;
}

export const createUserStore = (serverUser: ServerUser | null) => {
  const initialState = getInitialState(serverUser);

  return create<UserState>((set) => ({
    ...initialState,

    // Actions
    setUser: (user: User | null) => set({ 
      user: user ? transformUserToAppUser(user) : null 
    }),
    setAuthenticated: (authenticated: boolean) => set({ authenticated }),
    clearUser: () => set({ user: null, authenticated: false })
  }));
};

export const useUserStore = create<UserState>((set) => ({
  // Default state
  user: null,
  authenticated: false,
  initialized: false,

  // Actions
  setUser: (user: User | null) => set({ 
    user: user ? transformUserToAppUser(user) : null 
  }),
  setAuthenticated: (authenticated: boolean) => set({ authenticated }),
  clearUser: () => set({ user: null, authenticated: false }),
  
  // Initialize from server user
  initializeUser: (serverUser: ServerUser | null) => {
    const initialState = getInitialState(serverUser);
    set(initialState);
  }
}));