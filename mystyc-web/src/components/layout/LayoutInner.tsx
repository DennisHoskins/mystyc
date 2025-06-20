'use client';

import { useMemo } from 'react';
import { useTransitions } from '@/components/context/TransitionContext';

import StateTransition from '@/components/transition/StateTransition';
import PageTransition from '@/components/transition/PageTransition';
import WebsiteHeader from './header/WebsiteHeader';
import AppHeader from './header/AppHeader';
import Main from '@/components/Main';
import WebsiteFooter from './footer/WebsiteFooter';
import AppFooter from './footer/AppFooter';

export default function LayoutInner({
  children,
  isWebsite
}: {
  children: React.ReactNode;
  isWebsite: boolean;
}) {
  const { stateTransitionRef, pageTransitionRef } = useTransitions();

  return useMemo(() => {
    const Header = isWebsite ? WebsiteHeader : AppHeader;
    const Footer = isWebsite ? WebsiteFooter : AppFooter;

    return (
      <StateTransition ref={stateTransitionRef} isWebsite={isWebsite}>
        <Header />
        <PageTransition ref={pageTransitionRef}>
          <Main>{children}</Main>
        </PageTransition>
        <Footer />
      </StateTransition>
    );
  }, [isWebsite, children, stateTransitionRef, pageTransitionRef]);
}
