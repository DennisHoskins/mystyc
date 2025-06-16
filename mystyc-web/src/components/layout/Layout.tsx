'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { useUser, useClearUser, useAuthenticated } from '@/components/context/AppContext';
import { useAppStore } from '@/store/appStore';

import WebsiteLayout from './WebsiteLayout';
import AppLayout from './AppLayout';
import ServerLogoutForm from '../auth/ServerLogoutForm';

export default function Layout({ children }: { children: React.ReactNode; }) {
  const user = useUser();
  const clearUser = useClearUser();
  const authenticated = useAuthenticated();
  const { isLoggedOutByServer, setLoggedOutByServer } = useAppStore();
  const path = usePathname();

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

  // Determine what to render inside layout
  const getContent = () => {
    if (!user && authenticated) return null;
    if (isLoggedOutByServer) return <ServerLogoutForm />;
    return children;
  };

  // Determine layout type
  const isAppLayout = user && !isLoggedOutByServer && path !== '/logout';
  const Layout = isAppLayout ? AppLayout : WebsiteLayout;

  return <Layout>{getContent()}</Layout>;
}