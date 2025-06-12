'use client';

import Header from './header/Header';
import MainWrapper from '@/components/layout/MainWrapper';
import Footer from './footer/Footer';

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
        <MainWrapper>
          {children}
        </MainWrapper>              
      <Footer />
    </>
  );
}