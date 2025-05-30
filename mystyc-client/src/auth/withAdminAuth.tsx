'use client';

import { useEffect, useState } from 'react';

import { useAuth } from '@/components/context/AuthContext';
import { useCustomRouter } from '@/hooks/useCustomRouter';
import { isUserAdmin } from '@/auth/util';

export function withAdminAuth<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function ProtectedAdminRoute(props: P) {
    const router = useCustomRouter();
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    const { user, loading } = useAuth();

    useEffect(() => {
      if (!loading) {
        if (!user || !isUserAdmin(user?.userProfile)) {
          setIsRedirecting(true);
          router.push('/');
        } else {
          setIsLoading(false);
        }
      }
    }, [user, loading, router]);

    if (loading || isRedirecting || isLoading) {
      return null;
    }

    if (!user || !isUserAdmin(user?.userProfile)) {
      return null;
    }

    return <Component {...props} />;
  };
}