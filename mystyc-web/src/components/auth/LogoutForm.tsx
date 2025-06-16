'use client';

import { useState, useRef, useEffect } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import { useInitialized, useUser, useClearUser, useBusy } from '@/components/context/AppContext';

import FormLayout from '@/components/form/FormLayout';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';

export default function LogoutPage() {
  const router = useTransitionRouter();
  const user = useUser();
  const initialized = useInitialized();
  const clearUser = useClearUser();
  const { signOut } = useAuth();
  const { isBusy } = useBusy();

  const [isReady, setIsReady] = useState(false);
  const [isLogout, setIsLogout] = useState(false);
  const [started, setStarted] = useState(false);
  const [startCountdown, setStartCountdown] = useState(false);
  const [count, setCount] = useState(5);
  const [error, setError] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // mount guard
  useEffect(() => {
    if (isReady) {
      return;
    }
    setIsReady(true);
    setIsLogout(user != null);
  }, [user, isReady]);

  // logout and start redirect timer
  useEffect(() => {
    if (!isReady || !initialized || started) {
      return;
    }

    setStarted(true);

    if (!user) {
      router.replace('/');
      return;
    }

    signOut()
      .then(() => {
        clearUser();
        setStartCountdown(true);
      })
      .catch((err: any) => {
        console.error('Logout error:', err);
        setError(
          err.code === 500
            ? 'Server error. Please try again.'
            : 'Logout failed. Please try again.'
        );
        router.replace('/');
      });
  }, [isReady, initialized, started, user, router, signOut, clearUser]);

  // countdown timer
  useEffect(() => {
    if (!startCountdown) return;
    timerRef.current = setInterval(() => {
      setCount(c => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startCountdown]);

  // when countdown hits zero, redirect
  useEffect(() => {
    if (count === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      router.replace('/');
    }
  }, [count, router]);

  const handleHomeClick = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    router.replace('/');
  };

  // Prevent any render until after mount
  if (!isLogout || !isReady || !initialized) {
    return null;
  }

  return (
    <FormLayout subtitle="Sign in to continue your journey..." error={error}>
      <Text>Thanks for using mystyc! We hope to see you again soon.</Text>

      <Button loading={isBusy} onClick={handleHomeClick} className="w-full">
        Home
      </Button>

      {!error && (
        <Text variant="small">
          Redirecting automatically in {count} second{count !== 1 ? 's' : ''}...
        </Text>
      )}
    </FormLayout>
  );
}
