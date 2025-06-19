'use client';

import { useEffect } from 'react';
import { useUser, useClearUser, useAuthenticated } from '@/components/context/AppContext';
import { useAppStore } from '@/store/appStore';
import { TransitionProvider } from '@/components/context/TransitionContext';
import LayoutInner from './LayoutInner'
import Modal from '@/components/modal/Modal';
import ServerLogoutForm from '@/components/auth/ServerLogoutForm';

export default function Layout({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const clearUser = useClearUser();
  const authenticated = useAuthenticated();
  const { isLoggedOutByServer, setLoggedOutByServer } = useAppStore();
  const isWebsite = !user;


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

      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
  }, [user, authenticated, clearUser, setLoggedOutByServer]);

 return (
    <>
      <TransitionProvider>
        <LayoutInner isWebsite={isWebsite}>
          {children}
        </LayoutInner>
      </TransitionProvider>
      <Modal isOpen={isLoggedOutByServer}>
        <ServerLogoutForm />
      </Modal>
    </>
 );  
}