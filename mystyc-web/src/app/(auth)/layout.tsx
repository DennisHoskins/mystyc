'use client'

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useInitialized, useUser } from '@/components/ui/layout/context/AppContext';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import WebsiteLayout from "@/components/website/WebsiteLayout";
import AuthLayout from '@/components/auth/AuthLayout';
import Modal from '@/components/ui/modal/Modal';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useUser();
  const initialized = useInitialized();
  const router = useTransitionRouter();
  const [isAuth, setIsAuth] = useState(false);
  const isLogout = pathname === '/logout';

  useEffect(() => {
    if (!initialized) return;
    if (isLogout) return;
    setIsAuth(user == null);
    if (user && !isAuth) router.replace('/home', false);
  }, [initialized, isLogout, isAuth, user, router]);

  if (initialized && isLogout) {
    return (
      <>
        <WebsiteLayout />
        {children}
      </>
    );
  }

  return (
    <>
      <WebsiteLayout />
      <Modal isOpen={true} onClose={() => router.back()}>
        <AuthLayout>
          {children}
        </AuthLayout>        
      </Modal>
    </>
  );
}
