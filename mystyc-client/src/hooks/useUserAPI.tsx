import { useState } from 'react';
import { User as FirebaseAuthUser } from 'firebase/auth';
import { apiClient } from '@/api/apiClient';
import { User, Device, AuthEvent } from '@/interfaces';
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
      logger.log('[useUserAPI] Cache miss - fetching from API...');
      const user = await apiClient.getCurrentUser(token);
      logger.log('[useUserAPI] Complete user response:', user);
      setCachedUser(user);
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

  const fetchCompleteUserWithDevice = async (
    token: string,
    firebaseUser: FirebaseAuthUser,
    deviceData: Device,
    authEventData: AuthEvent,
    setUser: (user: User | null) => void,
    regenerateDeviceId: () => string
  ): Promise<User | null> => {
    try {
      logger.log('[useUserAPI] Fetching user with device registration...');
      const user = await apiClient.getCurrentUserWithDevice(token, deviceData, authEventData);
      logger.log('[useUserAPI] Complete user with device response:', user);
      
      setCachedUser(user);
      setUser(user);
      return user;
    } catch (err: any) {
      // Handle device conflict errors gracefully
      if (err?.status === 409) {
        logger.warn('[useUserAPI] Device hijacking detected, falling back to regular fetch');
        errorHandler.processError(err, {
          component: 'useUserAPI',
          action: 'fetchCompleteUserWithDevice-409',
          userId: firebaseUser.uid
        });
        
        // Fall back to regular user fetch without device registration
        return await fetchCompleteUser(token, firebaseUser, setUser);
      }
      
      if (err?.status === 404) {
        logger.warn('[useUserAPI] Device not found, regenerating device ID and retrying');
        errorHandler.processError(err, {
          component: 'useUserAPI',
          action: 'fetchCompleteUserWithDevice-404',
          userId: firebaseUser.uid
        });
        
        try {
          // Regenerate device ID and retry once
          const newDeviceId = regenerateDeviceId();
          const updatedDeviceData = { ...deviceData, deviceId: newDeviceId };
          
          logger.log('[useUserAPI] Retrying with new device ID:', newDeviceId);
          const userRetry = await apiClient.getCurrentUserWithDevice(token, updatedDeviceData, authEventData);
          setCachedUser(userRetry);
          setUser(userRetry);
          return userRetry;
        } catch (retryErr) {
          logger.warn('[useUserAPI] Retry with new device ID failed, falling back to regular fetch');
          errorHandler.processError(retryErr, {
            component: 'useUserAPI',
            action: 'fetchCompleteUserWithDevice-404-retry',
            userId: firebaseUser.uid
          });
          
          // Fall back to regular user fetch
          return await fetchCompleteUser(token, firebaseUser, setUser);
        }
      }
      
      // For all other errors, bubble up normally
      errorHandler.processError(err, {
        component: 'useUserAPI',
        action: 'fetchCompleteUserWithDevice',
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
      setCachedUser(updatedUser);
      setUser(updatedUser);
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
    fetchCompleteUserWithDevice,
    updateUserProfile,
    isUpdatingProfile
  };
}