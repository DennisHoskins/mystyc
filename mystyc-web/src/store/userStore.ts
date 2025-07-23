import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { User } from 'mystyc-common/schemas/';
import { UserRole } from 'mystyc-common/constants/roles.enum';

import { AppUser } from '@/interfaces/app/app-user.interface';

const transformUserToAppUser = (user: User): AppUser => ({
  ...user,
  isAdmin: user.userProfile.roles.includes(UserRole.ADMIN),
  isOnboard: user.userProfile.zodiacSign != null,
  isPlus: user.userProfile.subscription.level == 'plus'
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

  return create<UserState>()(
    persist(
      (set) => ({
        ...initialState,

        // Actions
        setUser: (user: User | null) => set({ 
          user: user ? transformUserToAppUser(user) : null 
        }),
        clearUser: () => set({ user: null })
      }),
      {
        name: 'user-storage'
      }
    )
  );
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: 'user-storage'
    }
  )
);