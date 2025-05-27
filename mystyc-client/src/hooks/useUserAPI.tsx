import { useState } from 'react';
import { User as FirebaseAuthUser } from 'firebase/auth';
import { apiClient } from '@/api/apiClient';
import { User } from '@/interfaces/user.interface';
import { errorHandler } from '@/util/errorHandler';
import { logger } from '@/util/logger';
import { useUserCache } from './useUserCache';

export function useUserAPI() {
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const { setCachedUser } = useUserCache();

  const fetchCompleteUser = async (
    token: string,
    firebaseUser: FirebaseAuthUser,
    setUser: (user: User | null) => void
  ): Promise<User | null> => {
    try {
      logger.log('🔵 [useUserAPI] Cache miss - fetching from API...');
      const user = await apiClient.getCurrentUser(token);
      logger.log('🔵 [useUserAPI] Complete user response:', user);
      
      setCachedUser(firebaseUser.uid, user);
      setUser(user);
      return user;
    } catch (err) {
      errorHandler.processError(err, {
        component: 'useUserAPI',
        action: 'fetchCompleteUser',
        userId: firebaseUser.uid
      });
      
      setUser(null);
      return null;
    }
  };

  const updateUserProfile = async (
    token: string,
    firebaseUser: FirebaseAuthUser,
    data: Partial<{ fullName?: string; dateOfBirth?: string; zodiacSign?: string }>,
    setUser: (user: User | null) => void,
    isRefreshingToken: boolean
  ) => {
    if (isUpdatingProfile) throw new Error('Profile update already in progress');
    
    while (isRefreshingToken) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setIsUpdatingProfile(true);
    try {
      const updatedUser = await apiClient.updateUserProfile(token, data);
      
      try {
        setCachedUser(firebaseUser.uid, updatedUser);
        setUser(updatedUser);
      } catch (cacheErr) {
        errorHandler.processError(cacheErr, {
          component: 'useUserAPI',
          action: 'updateUserProfile-cache',
          userId: firebaseUser.uid
        });
        
        setUser(updatedUser);
      }
    } catch (err) {
      errorHandler.processError(err, {
        component: 'useUserAPI',
        action: 'updateUserProfile',
        userId: firebaseUser.uid
      });
      
      throw err;
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  return {
    fetchCompleteUser,
    updateUserProfile,
    isUpdatingProfile
  };
}