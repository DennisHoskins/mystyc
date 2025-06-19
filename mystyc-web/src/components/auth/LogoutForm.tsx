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
    if (!initialized) {
      return;
    }
    if (isReady) {
      return;
    }
    setIsReady(true);
    setIsLogout(user != null);
  }, [initialized, isReady, user]);

  // Redirect when fully initialized and user is cleared
  useEffect(() => {
    if (initialized && !user) {
      router.replace('/', !isLogout);
    }
  }, [initialized, user, isLogout, router]);
  
  useEffect(() => {
    if (!user || !isLogout) {
      return;
    }

    console.log("");
    console.log("");
    console.log("LOGOUT");
    console.log("");
    console.log("");

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