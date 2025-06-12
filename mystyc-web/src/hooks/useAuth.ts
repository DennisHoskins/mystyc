'use client';

import { apiFirebase } from '@/api/firebase/apiFirebase';
import { apiClient } from '@/api/client/apiClient';
import { authCache } from '@/util/authCache';
import getDeviceFingerprint from '@/util/getDeviceFingerprint';
import { User } from '@/interfaces';
import { errorHandler } from '@/util/errorHandler';
import { logger } from '@/util/logger';

export function useAuth() {

  async function completeSignIn(firebaseUser: any): Promise<User | null> {
    try {
      authCache.clearCache();

      const token = await apiFirebase.getIdToken(firebaseUser, true);

      const deviceId = authCache.getDeviceFingerprint();
      const device = getDeviceFingerprint(firebaseUser.uid, deviceId);

      const user = await apiClient.registerSession(firebaseUser.uid, device, token);

      authCache.setFirebaseUid(firebaseUser.uid);
      return user;
    } catch (err: any) {
      errorHandler.processError(err, {
        component: 'useAuth',
        action: 'completeSignIn',
        userId: firebaseUser.uid,
      });

      throw(err);
    }
  }

  async function signIn(email: string, password: string) {
    const firebaseUser = await apiFirebase.signIn(email, password);
    return completeSignIn(firebaseUser);
  }

  async function register(email: string, password: string) {
    const firebaseUser = await apiFirebase.register(email, password);
    return completeSignIn(firebaseUser);
  }

  async function signOut() {
    try {
      await apiClient.logout();

      await apiFirebase.signOut();

      authCache.clearCache();
      logger.log('[useAuth] Signed out, app state reset');
    } catch (err) {
      errorHandler.processError(err, {
        component: 'useAuth',
        action: 'signOut',
      });

      throw err;
    }
  }

  async function resetPassword(email: string) {
    await apiFirebase.resetPassword(email);
  }

  return {
    signIn,
    register,
    resetPassword,
    signOut,
  };
}