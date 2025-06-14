'use client'

import { useState, useRef, useEffect } from 'react';

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
  const [ isLogout, setIsLogout ] = useState(false);
  const [error, setError] = useState('');
  const [startCountdown, setStartCountdown] = useState(false);
  const [count, setCount] = useState(5);
  const [hasStartedLogout, setHasStartedLogout] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if ((!app || !app.user) && !isLogout) {
      router.replace('/');
    }
  }, [app, isLogout, router]);  

  // Handle logout on first render
  if (!hasStartedLogout) {
    setHasStartedLogout(true);
    (async () => {
      await logout();
    })();
  }

  async function logout() {
    try {
      await signOut();
      setIsLogout(true);
      setUser(null);
      setStartCountdown(true);
    } catch(err: any) {
      console.error('Logout error:', err);
      
      switch (err.code) {
        case 500:
          setError('Server error. Please try again.');
          break;
        default:
          setError('Logout failed. Please try again.');
      }
    }
  }

  useEffect(() => {
    if (!startCountdown) {
      return;
    }
    
    timerRef.current = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return c - 1;
      })
    }, 1000);
  }, [startCountdown]);

  useEffect(() => {
    if (count === 0) {
      router.push('/');
    }
  }, [count, router]);

  const handleHomeClick = () => {
    if (timerRef.current) {
    clearInterval(timerRef.current);
    }
    router.push('/');
  }

  return (
    <FormLayout
      subtitle="Sign in to continue your journey..."
      error={error}
    >
    <Text>
      Thanks for using mystyc! We hope to see you again soon.
    </Text>

    <Button 
      loading={isBusy}
      onClick={handleHomeClick}
      className="w-full"
    >
      Home
    </Button>
     
    {!error &&
      <Text variant="small">
        Redirecting automatically in {count} second{count !== 1 ? 's' : ''}...
      </Text>
    }
    </FormLayout>
  );
}