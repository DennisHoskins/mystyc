// src/components/auth/LogoutForm.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useCustomRouter } from '@/hooks/useCustomRouter';
import { useBusy } from '@/components/context/BusyContext';
import { useApp } from '@/components/context/AppContext';

import FormLayout from '@/components/layout/FormLayout';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';

export default function LogoutPage() {
  const router = useCustomRouter();
  const { signOut } = useAuth();
  const { app, setUser } = useApp();
  const { isBusy } = useBusy();

  const [error, setError] = useState('');
  const [startCountdown, setStartCountdown] = useState(false);
  const [count, setCount] = useState(5);
  const [hasStartedLogout, setHasStartedLogout] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const noUser = !app || !app.user;

  // redirect immediately when no user
  useEffect(() => {
    if (noUser && !hasStartedLogout) router.replace('/');
  }, [noUser, hasStartedLogout, router]);

  if (noUser && !hasStartedLogout) return null;   // no flash

  const logout = useCallback(async () => {
    try {
      await signOut();
      setUser(null);
      setStartCountdown(true);
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err.code === 500 ? 'Server error. Please try again.' : 'Logout failed. Please try again.');
    }
  }, [signOut, setUser]);

  // run logout once
  useEffect(() => {
    if (!hasStartedLogout) {
      setHasStartedLogout(true);
      logout();
    }
  }, [hasStartedLogout, logout]);

  // countdown
  useEffect(() => {
    if (!startCountdown) return;

    timerRef.current = setInterval(() => {
      setCount(c => (c <= 1 ? 0 : c - 1));
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [startCountdown]);

  useEffect(() => {
    if (count === 0) router.push('/');
  }, [count, router]);

  const handleHomeClick = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    router.push('/');
  };

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
