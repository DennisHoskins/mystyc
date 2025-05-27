'use client';

import { useEffect, useState } from 'react';

import { useAuth } from '@/components/context/AuthContext';
import { useCustomRouter } from '@/hooks/useCustomRouter';
import { isUserOnboarded } from '@/auth/util';
import { logger } from '@/util/logger';

interface WithAuthOptions {
  requireOnboarding?: boolean;
  redirectTo?: string;
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthOptions = {}
): React.FC<P> {
  const { 
    requireOnboarding = false, 
    redirectTo = '/login' 
  } = options;

  return function ProtectedRoute(props: P) {
    const router = useCustomRouter();
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    const { user, loading, ready } = useAuth();

    useEffect(() => {
      if (loading || !ready) {
        return;
      }

      if (!user && !isRedirecting) {
        logger.info('withAuth: No user found, redirecting to login');
        setIsRedirecting(true);
        router.push(redirectTo);
        return;
      }

      if (user && requireOnboarding && !isUserOnboarded(user?.userProfile) && !isRedirecting) {
        logger.info('withAuth: User not onboarded, redirecting for onboarding');
        setIsRedirecting(true);
        router.replace('/');
        return;
      }

      if (user) {
        setIsLoading(false);
      }
    }, [user, loading, ready, router, isRedirecting, requireOnboarding, redirectTo]);

    if (loading || !ready || isRedirecting || isLoading) {
      return null;
    }

    if (!user) {
      return null;
    }

    if (requireOnboarding && !isUserOnboarded(user?.userProfile)) {
      return null;
    }

    return <Component {...props} />;
  };
}