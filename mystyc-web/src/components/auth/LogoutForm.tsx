'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/appStore';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import { useUser, useClearUser} from '@/components/context/AppContext';

export default function LogoutPage() {
  const router = useTransitionRouter();
  const user = useUser();
  const clearUser = useClearUser();
  const { signOut } = useAuth();
  const { setLoggedOut } = useAppStore();

  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    if (isReady) {
      return;
    }

    setIsReady(true);
    if (!user) {
      return;
    }

    signOut()
      .then(() => {
        clearUser();
      })
      .catch((err: any) => {
        console.error('Logout error:', err);
      }).finally(() => {
        setLoggedOut(true);
        router.replace('/');
      });
  }, [user, isReady, setLoggedOut]);

  return null;
}