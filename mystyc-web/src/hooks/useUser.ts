import { useState, useCallback } from 'react';
import { User as FirebaseAuthUser } from 'firebase/auth';
import { apiClient } from '@/api/client/apiClient';
import { App } from '@/interfaces/app.interface';
import { useApp } from '@/components/context/AppContext';
import { User, AuthEventLoginRegister } from '@/interfaces';
import { errorHandler } from '@/util/errorHandler';
import { logger } from '@/util/logger';
import getDevice from '@/util/getDeviceFingerprint';

export function useUser() {
  const { app, setApp } = useApp();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const fetchCompleteUser = useCallback(async (firebaseUser: FirebaseAuthUser): Promise<User | null> => {
    if (!app) {
      return null;
    }

    try {
      logger.log('[useUser] Fetching user from API...');
      const user = await apiClient.getCurrentUser();
      
      const newAppState = { ...app, user };
      setApp(newAppState);

      return user;
    } catch (err) {
      errorHandler.processError(err, {
        component: 'useUser',
        action: 'fetchCompleteUser',
        userId: firebaseUser.uid
      });
      
      const newAppState = { ...app, user: null };
      setApp(newAppState);
      return null;
    }
 }, [app, setApp]);

  const fetchCompleteUserWithDevice = useCallback(async (
    firebaseUser: FirebaseAuthUser
  ): Promise<User | null> => {
    if (!app) {
      return null;
    }

    if (!app.deviceId) {
      return null;
    }

    try {
      logger.log('[useUser] Fetching user with device registration...');

      const deviceData = getDevice(firebaseUser.uid, app.deviceId);

      const registerDTO: AuthEventLoginRegister = {
        device: deviceData,
        clientTimestamp: new Date().toISOString()
      };

      const user = await apiClient.registerSession(registerDTO);
      
      const newAppState: App = { 
        deviceId: app.deviceId,
        user: user,
        fcmToken: null
      };

      setApp(newAppState);
      return user;
    } catch (err: any) {
      // Handle errors, fall back to regular fetch
      if (err?.status === 409 || err?.status === 404) {
        logger.warn('[useUser] Device registration failed, falling back to regular fetch');
        return await fetchCompleteUser(firebaseUser);
      }
      
      errorHandler.processError(err, {
        component: 'useUser',
        action: 'fetchCompleteUserWithDevice',
        userId: firebaseUser.uid
      });
      
      const newAppState = { ...app, user: null };
      setApp(newAppState);
      return null;
    }
  }, [app, setApp, fetchCompleteUser]);

  const clearUser = useCallback(async (): Promise<void> => {
    if (!app) {
      return;
    }
    try {
      const newAppState = { 
        deviceId: null,
        user: null,
        fcmToken: app.fcmToken
      };
      setApp(newAppState);
      logger.log('[useUser] User cleared and synced successfully');
    } catch (err) {
      errorHandler.processError(err, {
        component: 'useUser',
        action: 'clearUser'
      });
      throw err;
    }
  }, [app, setApp]);

  const updateProfile = useCallback(async (
    data: Partial<{ fullName?: string; dateOfBirth?: string; zodiacSign?: string }>
  ): Promise<void> => {
    if (!app) {
      return;
    }

    if (isUpdatingProfile) throw new Error('Profile update already in progress');
    
    setIsUpdatingProfile(true);
    try {
      const updatedUser = await apiClient.updateUserProfile(data);
      
      const newAppState: App = { 
        deviceId: app.deviceId,
        user: updatedUser,
        fcmToken: null
      };

      setApp(newAppState);
    } catch (err) {
      errorHandler.processError(err, {
        component: 'useUser',
        action: 'updateProfile'
      });
      throw err;
    } finally {
      setIsUpdatingProfile(false);
    }
  }, [app, setApp, isUpdatingProfile]);

  return {
    fetchCompleteUser,
    fetchCompleteUserWithDevice,
    clearUser,
    updateProfile,
    isUpdatingProfile
  };
}