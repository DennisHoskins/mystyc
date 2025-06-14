'use client';

import { apiClient } from '@/api/apiClient';

export function useAuth() {

  async function register(email: string, password: string) {
    return await apiClient.register(email, password);
  }

  async function signIn(email: string, password: string) {
    return await apiClient.signIn(email, password);
  }

  async function resetPassword(email: string) {
    await apiClient.resetPassword(email);
  }

  async function signOut() {
    return await apiClient.signOut();
  }

  return {
    signIn,
    register,
    resetPassword,
    signOut,
  };
}