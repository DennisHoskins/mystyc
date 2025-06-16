'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { useUser, useClearUser, useAuthenticated } from '@/components/context/AppContext';
import { useAppStore } from '@/store/appStore';

import WebsiteLayout from './WebsiteLayout';
import AppLayout from './AppLayout';
import ServerLogoutForm from '../auth/ServerLogoutForm';

interface LayoutManagerProps {
  children: React.ReactNode;
}

export default function LayoutManager({ children }: LayoutManagerProps) {
  const user = useUser();
  const clearUser = useClearUser();
  const authenticated = useAuthenticated();
  const { isLoggedOutByServer, setLoggedOutByServer } = useAppStore();
  const path = usePathname();

  console.log("LayoutManager", path, user, authenticated);

  // Handle server logout scenario
  useEffect(() => {
    if (!user && authenticated) {
      const logout = async () => {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'x-source': 'client-cleanup' },
        });
        clearUser();
      };

      setLoggedOutByServer(true);
      logout();
    }
  }, [user, authenticated, clearUser, setLoggedOutByServer]);

  // Don't render anything while logout is in progress
  if (!user && authenticated) {
    return null;
  }

  if (path === '/logout') {
    return <WebsiteLayout>{children}</WebsiteLayout>;
  }

  if (isLoggedOutByServer) {
    return <WebsiteLayout><ServerLogoutForm /></WebsiteLayout>;
  }
 
  return user ? (
    <AppLayout>{children}</AppLayout>
  ) : (
    <WebsiteLayout>{children}</WebsiteLayout>
  );
}