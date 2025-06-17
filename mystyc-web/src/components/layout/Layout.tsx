'use client';

import { useEffect, useRef, useState } from 'react';

import { useUser, useClearUser, useAuthenticated } from '@/components/context/AppContext';
import { useAppStore } from '@/store/appStore';
import Transition, { TransitionRef } from '@/components/transition/Transition';
import WebsiteLayout from './WebsiteLayout';
import AppLayout from './AppLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const clearUser = useClearUser();
  const authenticated = useAuthenticated();
  const { isLoggedOutByServer, setLoggedOutByServer, isLoggedOut, setLoggedOut, showToast } = useAppStore();
  const transitionRef = useRef<TransitionRef>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isWebsite = !user;
  const content = isWebsite ? (<WebsiteLayout>{children}</WebsiteLayout>) : (<AppLayout>{children}</AppLayout>);  

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
      logout();
    }
  }, [user, authenticated, clearUser, setLoggedOutByServer]);

  useEffect(() => {
    if (!isLoggedOut) {
      return;
    }
    showToast("You have been Signed Out", "success");
    setLoggedOut(false);
  }, [isLoggedOut]);

  useEffect(() => {
    const doTransition = async () => {
      if (transitionRef.current) {
        setIsTransitioning(true);
        await transitionRef.current.transition(content);
        setIsTransitioning(false);
      }
    };
  
    doTransition();
  }, [isWebsite, isLoggedOutByServer]);

  if (isTransitioning) {
    return;
  }

  return (
    <Transition ref={transitionRef}>
      {content}
    </Transition>
  );  
}