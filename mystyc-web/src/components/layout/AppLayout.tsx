'use client';

import AppHeader from './header/AppHeader';
import MainWrapper from '@/components/layout/LayoutWrapper';
import AppFooter from './footer/AppFooter';

export default function AppUserLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      <MainWrapper>
        {children}
      </MainWrapper>
      <AppFooter />
    </>
  );
}