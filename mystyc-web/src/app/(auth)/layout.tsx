'use client'

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useAppStore } from '@/store/appStore';
import { useInitialized, useUser } from '@/components/ui/context/AppContext';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import WebsiteLayout from "@/components/website/WebsiteLayout";
import Modal from '@/components/ui/modal/Modal';
import WebsiteHome from '@/components/website/WebsiteHome';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setModalShowing } = useAppStore();
  const user = useUser();
  const initialized = useInitialized();
  const router = useTransitionRouter();
  const [isAuth, setIsAuth] = useState(false);
  const isLogout = pathname === '/logout' || pathname == '/server-logout';

  useEffect(() => {
    if (!initialized) return;
    if (isLogout) return;
    setIsAuth(user == null);
    if (user && !isAuth) router.replace('/home', false);
  }, [initialized, isLogout, isAuth, user, router]);

  useEffect(() => {
    if (!initialized || isLogout) return;
    setModalShowing(true);
  }, [initialized, isLogout, setModalShowing]);  

  if (initialized && isLogout) {
    return (
      <>
        <WebsiteLayout><WebsiteHome /></WebsiteLayout>
        {children}
      </>
    );
  }

  const handleCloseModal = () => {
    setModalShowing(false);
    router.back();
  }

  return (
    <>
      <WebsiteLayout><WebsiteHome /></WebsiteLayout>
      <Modal isOpen={true} onClose={handleCloseModal}>
        {children}
      </Modal>
    </>
  );
}
