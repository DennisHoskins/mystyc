'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/appStore';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import { useInitialized, useUser, useClearUser} from '@/components/context/AppContext';

export default function LogoutPage() {
  const router = useTransitionRouter();
  const initialized = useInitialized();
  const user = useUser();
  const clearUser = useClearUser();
  const { signOut } = useAuth();
  const { showToast } = useAppStore();

  const [isReady, setIsReady] = useState(false);
  const [isLogout, setIsLogout] = useState(false);

  // mount guard
  useEffect(() => {
    if (isReady) {
      return;
    }
    setIsReady(true);
    setIsLogout(user != null);
  }, [isReady, user]);

  // Redirect when fully initialized and user is cleared
  useEffect(() => {
    if (initialized && !user) {
      router.replace('/');
    }
  }, [initialized, user, router]);
  
  useEffect(() => {
    if (!user || !isLogout) {
      return;
    }

    signOut()
      .then(() => {
        clearUser();
        showToast("You have been Logged Out", "success");
      })
      .catch((err: any) => {
        console.error('Logout error:', err);
      }).finally(() => {
        router.replace('/');
      });
  }, [user, isReady, clearUser, signOut, isLogout, showToast, router]);

  return null;
}