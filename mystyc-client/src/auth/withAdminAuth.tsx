'use client';

import { useEffect, useState } from 'react';

import { useAuth } from '@/components/context/AuthContext';
import { useCustomRouter } from '@/hooks/useCustomRouter';
import { isUserAdmin } from '@/auth/util';
import { logger } from '@/util/logger';

export function withAdminAuth<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function ProtectedAdminRoute(props: P) {
    const router = useCustomRouter();
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    // Safely try to access auth context
    let authState: { user: any; loading: boolean } | null = null;
    try {
      authState = useAuth();
    } catch (error) {
      logger.error("Auth context not available yet:", error);
      // Continue with null authState
    }
    
    const user = authState?.user;
    const loading = authState?.loading ?? true;

    useEffect(() => {
      // Only check auth if we have access to the context
      if (authState && !loading) {
        if (!user || !isUserAdmin(user?.userProfile)) {
          setIsRedirecting(true);
          router.push('/');
        } else {
          setIsLoading(false);
        }
      }
    }, [user, loading, router, authState]);

    if (loading || isRedirecting || isLoading) {
      return null;
    }

    // Don't render anything during auth check to prevent flash
    if (!user || !isUserAdmin(user?.userProfile)) {
      return null;
    }

    return <Component {...props} />;
  };
}