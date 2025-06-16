'use client';
import WebsiteHeader from './header/WebsiteHeader';
import MainWrapper from '@/components/layout/LayoutWrapper';
import WebsiteFooter from './footer/WebsiteFooter';

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WebsiteHeader />
      <MainWrapper>
        {children}
      </MainWrapper>
      <WebsiteFooter />
    </>
  );
}