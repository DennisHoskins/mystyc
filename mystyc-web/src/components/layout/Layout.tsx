'use client';

import { useEffect, useRef, useState, useMemo } from 'react';

import { useUser, useClearUser, useAuthenticated } from '@/components/context/AppContext';
import { useAppStore } from '@/store/appStore';
import StateTransition, { StateTransitionRef } from '@/components/transition/StateTransition';
import Modal from '@/components/modal/Modal';
import ServerLogoutForm from '@/components/auth/ServerLogoutForm';

import WebsiteHeader from './header/WebsiteHeader';
import AppHeader from './header/AppHeader';
import Main from '@/components/Main';
import WebsiteFooter from './footer/WebsiteFooter';
import AppFooter from './footer/AppFooter';

export default function Layout({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const clearUser = useClearUser();
  const authenticated = useAuthenticated();
  const { isLoggedOutByServer, setLoggedOutByServer } = useAppStore();
  const transitionRef = useRef<StateTransitionRef>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const wasServerLogout = useRef(false);
  const isWebsite = !user;
  const content = useMemo(() => 
    isWebsite ? (
      <>
        <WebsiteHeader />
        <Main>
          {children}
        </Main>
        <WebsiteFooter />
      </>
    ) : (
      <>
        <AppHeader />
        <Main>
          {children}
        </Main>
        <AppFooter />
      </>
    ),
    [isWebsite, children]
  );  

  // Handle server logout
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
      wasServerLogout.current = true;
      logout();
      
      // Redirect to home if on a protected page
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
  }, [user, authenticated, clearUser, setLoggedOutByServer]);

  useEffect(() => {
    const doTransition = async () => {
      if (transitionRef.current && !isInitialMount) {
        setIsTransitioning(true);
        await transitionRef.current.transition(content);
        setIsTransitioning(false);
      }
    };
  
    if (isInitialMount) {
      setIsInitialMount(false);
    } else {
      doTransition();
    }
  }, [isWebsite, isInitialMount, content]);

  if (isTransitioning) {
    return;
  }

  return (
    <>
      <StateTransition ref={transitionRef}>
        {content}
      </StateTransition>
      
      <Modal isOpen={isLoggedOutByServer}>
        <ServerLogoutForm />
      </Modal>
    </>
  );  
}