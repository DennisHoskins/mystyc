'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { useAppStore } from '@/store/appStore';
import { useUser, useClearUser, useAuthenticated } from '@/components/layout/context/AppContext';
import { TransitionProvider } from '@/components/layout/context/TransitionContext';
import StateTransition from '@/components/layout/transition/StateTransition';
import WebsiteHeader from '@/components/app/website/WebsiteHeader';
import AppHeader from '@/components/app/mystyc/MystycHeader';
import PageTransition from '@/components/layout/transition/PageTransition';
import Main from '@/components/layout/Main';
import WebsiteFooter from '@/components/app/website/WebsiteFooter';
import AppFooter from '@/components/app/mystyc/MystycFooter';
import Modal from '@/components/ui/modal/Modal';
import ServerLogoutForm from '@/components/app/auth/ServerLogoutForm';
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