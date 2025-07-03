import { create } from 'zustand';
import { User } from '@/interfaces/user.interface';
import { AppUser } from '@/interfaces/appUser.interface';

const transformUserToAppUser = (user: User): AppUser => ({
  ...user,
  isAdmin: user.userProfile.roles.includes("admin"),
  isOnboard: user.userProfile.zodiacSign != null
});

const getInitialState = (serverUser: User | null) => {
  if (serverUser === null) {
    return {
      user: null,
      initialized: true
    };
  } else if (serverUser) {
    return {
      user: transformUserToAppUser(serverUser),
      initialized: true
    };
  } else {
    return {
      user: null,
      initialized: true
    };
  }
};

export interface UserState {
  // State
  user: AppUser | null;
  initialized: boolean;

  // Actions
  setUser: (user: User | null) => void;
  clearUser: () => void;
}

export const createUserStore = (serverUser: User | null) => {
  const initialState = getInitialState(serverUser);

  return create<UserState>((set) => ({
    ...initialState,

    // Actions
    setUser: (user: User | null) => set({ 
      user: user ? transformUserToAppUser(user) : null 
    }),
    clearUser: () => set({ user: null })
  }));
};

export const useUserStore = create<UserState>((set) => ({
  // Default state
  user: null,
  initialized: false,

  // Actions
  setUser: (user: User | null) => set({ 
    user: user ? transformUserToAppUser(user) : null 
  }),
  clearUser: () => set({ user: null }),
  
  // Initialize from server user
  initializeUser: (serverUser: User | null) => {
    const initialState = getInitialState(serverUser);
    set(initialState);
  }
}));