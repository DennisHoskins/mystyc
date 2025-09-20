'use client'

import { useEffect } from 'react';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import { useAuth } from '@/hooks/useAuth';
import { useClearUser } from '@/components/ui/context/AppContext';

export default function ServerLogoutPage() {
  const router = useTransitionRouter();
  const clearUser = useClearUser();
  const { serverLogout } = useAuth();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Clear server state
        await serverLogout();
      } catch (error) {
        console.error('Server logout failed:', error);
        // Continue anyway - client state is already cleared
      }

      // Clear client state
      clearUser();    

      
      // Redirect to login
      router.replace('/login', false);
    };

    performLogout();
  }, [clearUser, serverLogout, router]);

  return null;
}