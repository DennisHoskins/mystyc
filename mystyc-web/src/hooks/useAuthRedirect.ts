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
  const isProcessing = useRef(false);
  const hasShownForm = useRef(false);

  useEffect(() => {
    if (!ready) return;
    if (hasRedirected.current) return;

    const isFetchingUser = idToken && !user;
    
    if (user && !isProcessing.current) {
      logger.log(`[${componentName}] User logged in, redirecting`);
      hasRedirected.current = true;
      router.replace(redirectTo);
    } else if (!user && !isProcessing.current && !isFetchingUser && !hasShownForm.current) {
      logger.log(`[${componentName}] Showing login form`);
      setShowForm(true);
      setBusy(false);
      hasShownForm.current = true;
    }
  }, [ready, user, idToken, router, redirectTo, componentName, setBusy]);

  useEffect(() => {
    if (user && isProcessing.current && !hasRedirected.current) {
      logger.log(`[${componentName}] Auth successful, redirecting`);
      hasRedirected.current = true;
      isProcessing.current = false;
      router.replace(redirectTo);
    }
  }, [user, router, redirectTo, componentName]);

  const startAuthProcess = () => {
    isProcessing.current = true;
    setBusy(true, 0);
  };

  const endAuthProcess = (success: boolean = false) => {
    if (!success) {
      isProcessing.current = false;
      setBusy(false);
    }
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