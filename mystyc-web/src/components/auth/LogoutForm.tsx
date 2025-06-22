'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/appStore';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import { useInitialized, useUser, useClearUser, useBusy } from '@/components/context/AppContext';
import { logger } from '@/util/logger';

export default function LogoutPage() {
  const router = useTransitionRouter();
  const initialized = useInitialized();
  const user = useUser();
  const clearUser = useClearUser();
  const { setBusy } = useBusy();
  const { signOut } = useAuth();
  const { showToast } = useAppStore();

  const [isReady, setIsReady] = useState(false);
  const [isLogout, setIsLogout] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

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

  useEffect(() => {
    if (initialized && !user && !isLogout) {
      router.replace('/', false);
    }
  }, [initialized, user, isLogout, router]);

  useEffect(() => {
    if (!user || !isLogout || isBusy) {
      return;
    }
    setBusy(500);
    setIsBusy(true);

    logger.log("LOGOUT");

    signOut()
      .then(() => {
        clearUser();
        showToast("You have been Logged Out", "success");
      })
      .catch((err: any) => {
        logger.error('Logout error:', err);
      }).finally(() => {
        router.replace('/', false);
      });
  }, [user, isReady, isBusy, setBusy, clearUser, signOut, isLogout, showToast, router]);

  return null;
}