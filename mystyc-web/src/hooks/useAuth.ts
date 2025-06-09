'use client';

import { useCallback } from 'react';

import { apiFirebase } from '@/api/firebase/apiFirebase';
import { useFirebase } from '@/hooks/useFirebase';
import { useUser } from '@/hooks/useUser';
import { useApp } from '@/components/context/AppContext';

export function useAuth() {
 const { firebaseUser } = useFirebase();
 const { fetchCompleteUserWithDevice, clearUser } = useUser();
 const { app } = useApp();
  
 const signIn = useCallback(async (email: string, password: string) => {
   const firebaseUser = await apiFirebase.signIn(email, password);
   const user = await fetchCompleteUserWithDevice(firebaseUser);
   return user;
 }, [fetchCompleteUserWithDevice]);
 
 const signOut = useCallback(async () => {
   await apiFirebase.signOut();
   await clearUser();
 }, [clearUser]);
 
 const register = useCallback(async (email: string, password: string) => {
   const firebaseUser = await apiFirebase.register(email, password);
   const user = await fetchCompleteUserWithDevice(firebaseUser);
   return user;
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
   loading: !app
 };
}