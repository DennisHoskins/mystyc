'use client'

import { useState, useEffect } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/context/AppContext';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import { useInitialized, useUser, useClearUser, useBusy } from '@/components/ui/context/AppContext';
import { logger } from '@/util/logger';

export default function LogoutPage() {
  const { signOut } = useAuth();
  const router = useTransitionRouter();
  const initialized = useInitialized();
  const showToast = useToast();
  const user = useUser();
  const clearUser = useClearUser();
  const { setBusy } = useBusy();

  const [isLogout, setIsLogout] = useState(false);
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    if (!initialized) return;
    setIsLogout(user != null);
    if (!user && !isLogout) router.replace('/', false);
  }, [initialized, isLogout, user, router]);

  useEffect(() => {
    if (!user || !isLogout || isWorking) return;
    setBusy(true);
    setIsWorking(true);

    signOut()
      .then(() => {
        clearUser();
        showToast("You have been Logged Out", "success");
        router.replace("/");
        setBusy(false);
      })
      .catch((err: any) => {
        logger.error('Logout error:', err);
      });
  }, [user, isLogout, isWorking, setBusy, signOut, clearUser, showToast, router]);

  return null;
}