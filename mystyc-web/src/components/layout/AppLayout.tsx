'use client';

import AppHeader from './header/AppHeader';
import Main from '@/components/Main';
import AppFooter from './footer/AppFooter';

export default function AppUserLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      <Main>
        {children}
      </Main>
      <AppFooter />
    </>
  );
}