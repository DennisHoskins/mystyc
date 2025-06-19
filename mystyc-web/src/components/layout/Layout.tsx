'use client';

import { useEffect, useMemo } from 'react';
import { useUser, useClearUser, useAuthenticated } from '@/components/context/AppContext';
import { useAppStore } from '@/store/appStore';
import { TransitionProvider, useTransitions } from '@/components/context/TransitionContext';
import StateTransition from '@/components/transition/StateTransition';
import PageTransition from '@/components/transition/PageTransition';
import WebsiteHeader from './header/WebsiteHeader';
import AppHeader from './header/AppHeader';
import Main from '@/components/Main';
import WebsiteFooter from './footer/WebsiteFooter';
import AppFooter from './footer/AppFooter';
import Modal from '@/components/modal/Modal';
import ServerLogoutForm from '@/components/auth/ServerLogoutForm';

export default function Layout({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const clearUser = useClearUser();
  const authenticated = useAuthenticated();
  const { isLoggedOutByServer, setLoggedOutByServer } = useAppStore();
  const { stateTransitionRef, pageTransitionRef } = useTransitions();
  const isWebsite = !user;

  const content = useMemo(() => {
    const Header = isWebsite ? WebsiteHeader : AppHeader;
    const Footer = isWebsite ? WebsiteFooter : AppFooter;
   
    return (
      <StateTransition ref={stateTransitionRef}>
        <Header />
          <PageTransition ref={pageTransitionRef}>
            <Main>
              {children}
            </Main>
          </PageTransition>
        <Footer />
      </StateTransition>
    );
 }, [isWebsite, children, stateTransitionRef, pageTransitionRef]);

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
      {content}
    </TransitionProvider>
     <Modal isOpen={isLoggedOutByServer}>
       <ServerLogoutForm />
     </Modal>
    </>
 );  
}