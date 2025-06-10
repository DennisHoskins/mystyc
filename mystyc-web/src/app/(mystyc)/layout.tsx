'use client'

import { useApp } from '@/components/context/AppContext';
import HeaderUser from '@/components/layout/header/HeaderUser';
import FooterUser from '@/components/layout/footer/FooterUser';

export default function MystycLayout({ children }: { children: React.ReactNode }) {
  const { app } = useApp();
  if (!app || !app.user) {
    return null;
  }

  return (
    <>
      <HeaderUser />
        {children}
      <FooterUser />
    </>
  );
}
