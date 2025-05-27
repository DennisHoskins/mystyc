import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/context/AuthContext';
import { useCustomRouter } from '@/hooks/useCustomRouter';
import { useBusy } from '@/components/context/BusyContext';
import { logger } from '@/util/logger';

interface UseAuthRedirectOptions {
  redirectTo?: string;
  componentName: string;
}

export function useAuthRedirect(options: UseAuthRedirectOptions = { componentName: 'Unknown' }) {
  const { redirectTo = '/', componentName } = options;
  const { user, ready, idToken } = useAuth();
  const router = useCustomRouter();
  const { setBusy } = useBusy();
  const [showForm, setShowForm] = useState(false);
  const hasRedirected = useRef(false);
  const isProcessing = useRef(false); // Start as false, not true

  useEffect(() => {
    logger.log(`🟡 [${componentName}] Component mounted`);
  }, [componentName]); // Remove setBusy(false) call

  // Handle auth state and redirect logic
  useEffect(() => {
    logger.log(`🟡 [${componentName}] Auth check effect triggered:`, {
      ready,
      user: !!user,
      idToken: !!idToken,
      hasRedirected: hasRedirected.current,
      isProcessing: isProcessing.current,
      showForm
    });

    if (!ready) return;

    // If already redirected, don't do anything
    if (hasRedirected.current) return;

    // If we have an idToken but no user yet, we're still fetching user data
    const isFetchingUser = idToken && !user;
    
    if (user && !isProcessing.current) {
      // User is already logged in and we're not processing auth
      logger.log(`🟡 [${componentName}] User already logged in, redirecting`);
      hasRedirected.current = true;
      router.replace(redirectTo);
    } else if (!user && !isProcessing.current && !isFetchingUser) {
      // User is confirmed NOT logged in, safe to show form
      logger.log(`🟡 [${componentName}] User not logged in, showing form`);
      setShowForm(true);
      setBusy(false); // Clear busy when showing login form
    } else {
      logger.log(`🟡 [${componentName}] Waiting - not ready to show form yet. isFetchingUser:`, isFetchingUser);
    }
  }, [ready, user, idToken, router, showForm, redirectTo, componentName]);

  // Handle successful auth redirect
  useEffect(() => {
    logger.log(`🟡 [${componentName}] Login redirect effect triggered:`, {
      user: !!user,
      isProcessing: isProcessing.current,
      hasRedirected: hasRedirected.current
    });

    if (user && isProcessing.current && !hasRedirected.current) {
      // This handles successful auth - redirect and clear processing
      logger.log(`🟡 [${componentName}] Auth successful, redirecting`);
      hasRedirected.current = true;
      isProcessing.current = false; // Clear processing flag
      setBusy(false); // Clear busy state
      router.replace(redirectTo);
    }
  }, [user, router, redirectTo, componentName, setBusy]);

  const startAuthProcess = () => {
    isProcessing.current = true;
    setBusy(true, 0);
  };

  const endAuthProcess = (success: boolean = false) => {
    if (!success) {
      isProcessing.current = false; // Reset flag on error
    }
    setBusy(false);
  };

  const shouldRender = ready && (showForm || hasRedirected.current);
  const shouldShowForm = ready && showForm && !hasRedirected.current;

  return {
    shouldRender,
    shouldShowForm,
    startAuthProcess,
    endAuthProcess,
    hasRedirected: hasRedirected.current
  };
}