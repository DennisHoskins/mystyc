'use client';

import { useState, useEffect } from 'react';

import { apiClient } from '@/api/apiClient';
import { useToast } from '@/components/ui/layout/context/AppContext';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import { useInitialized, useUser, useClearUser, useBusy } from '@/components/ui/layout/context/AppContext';
import { logger } from '@/util/logger';

export default function LogoutPage() {
  const router = useTransitionRouter();
  const initialized = useInitialized();
  const showToast = useToast();
  const user = useUser();
  const clearUser = useClearUser();
  const { setBusy } = useBusy();

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

    apiClient.signOut()
      .then(() => {
        clearUser();
        showToast("You have been Logged Out", "success");
      })
      .catch((err: any) => {
        logger.error('Logout error:', err);
      }).finally(() => {
        router.replace('/');
      });
  }, [user, isReady, isBusy, setBusy, clearUser, isLogout, showToast, router]);

  return null;
}