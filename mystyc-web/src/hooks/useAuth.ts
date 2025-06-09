'use client';

import { useCallback } from 'react';

import { apiFirebase } from '@/api/apiFirebase';
import { useFirebase } from '@/hooks/useFirebase';
import { useUser } from '@/hooks/useUser';
import { useApp } from '@/components/context/AppContext';
import { collectDeviceFingerprint } from '@/util/deviceFingerprint';

export function useAuth() {
 const { firebaseUser } = useFirebase();
 const { fetchCompleteUserWithDevice, clearUser } = useUser();
 const { app } = useApp();
  
 const signIn = useCallback(async (deviceFingerprint: string, email: string, password: string) => {
   const firebaseUser = await apiFirebase.signIn(email, password);
   const device = collectDeviceFingerprint(firebaseUser.uid, deviceFingerprint);
   await fetchCompleteUserWithDevice(firebaseUser, device);
   return firebaseUser;
 }, [fetchCompleteUserWithDevice]);
 
 const signOut = useCallback(async () => {
   await apiFirebase.signOut();
   await clearUser();
 }, [clearUser]);
 
 const register = useCallback(async (deviceFingerprint: string, email: string, password: string) => {
   const firebaseUser = await apiFirebase.register(email, password);
   const device = collectDeviceFingerprint(firebaseUser.uid, deviceFingerprint);
   await fetchCompleteUserWithDevice(firebaseUser, device);
   return firebaseUser;
 }, [fetchCompleteUserWithDevice]);
 
 const resetPassword = useCallback(async (email: string) => {
   await apiFirebase.resetPassword(email);
 }, []);
 
 return { 
   signIn, 
   signOut, 
   register, 
   resetPassword,
   firebaseUser,
   user: app?.user,
   authToken: app?.authToken,
   loading: !app
 };
}