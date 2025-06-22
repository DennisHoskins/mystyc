'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { useAppStore } from '@/store/appStore';
import { useUser, useClearUser, useAuthenticated } from '@/components/context/AppContext';
import { TransitionProvider } from '@/components/context/TransitionContext';
import StateTransition from '@/components/transition/StateTransition';
import WebsiteHeader from './header/WebsiteHeader';
import AppHeader from './header/AppHeader';
import PageTransition from '@/components/transition/PageTransition';
import Main from '@/components/Main';
import WebsiteFooter from './footer/WebsiteFooter';
import AppFooter from './footer/AppFooter';
import Modal from '@/components/modal/Modal';
import ServerLogoutForm from '@/components/auth/ServerLogoutForm';
import { logger } from '@/util/logger';

export default function Layout({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const clearUser = useClearUser();
  const authenticated = useAuthenticated();
  const isLoggedOutByServer = useAppStore((s) => s.isLoggedOutByServer);
  const setLoggedOutByServer = useAppStore((s) => s.setLoggedOutByServer);
  const pathname = usePathname();
  const isWebsite = !user;

  useEffect(() => {
    logger.log('[LAYOUT] pathname', pathname);
  }, [pathname]);

  const Header = isWebsite ? WebsiteHeader : AppHeader;
  const Footer = isWebsite ? WebsiteFooter : AppFooter;

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
        <StateTransition>
          <Header />
          <PageTransition>
            <Main>{children}</Main>
          </PageTransition>
          <Footer />
        </StateTransition>
      </TransitionProvider>
      <Modal isOpen={isLoggedOutByServer}>
        <ServerLogoutForm />
      </Modal>
    </>
  );  
}