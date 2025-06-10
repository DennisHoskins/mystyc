'use client'

import { useApp } from '@/components/context/AppContext';

import HeaderPublic from '@/components/layout/header/HeaderPublic';
import FooterPublic from '@/components/layout/footer/FooterPublic';

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  const { app } = useApp();
  if (app && app.user) {
    return null;
  }

  return (
    <>
      <HeaderPublic />
        {children}
      <FooterPublic />
    </>
  );
}