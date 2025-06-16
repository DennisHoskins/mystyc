'use client';
import WebsiteHeader from './header/WebsiteHeader';
import Main from '@/components/Main';
import WebsiteFooter from './footer/WebsiteFooter';

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WebsiteHeader />
      <Main>
        {children}
      </Main>
      <WebsiteFooter />
    </>
  );
}