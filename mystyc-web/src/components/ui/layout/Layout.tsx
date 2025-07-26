'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { registerVisit } from '@/server/actions/analytics';
import { getDeviceInfo } from '@/util/getDeviceInfo';

import { useAppStore } from '@/store/appStore';
import { logger } from '@/util/logger'

import { useUser } from '@/components/ui/layout/context/AppContext';
import { TransitionProvider } from '@/components/ui/layout/context/TransitionContext';
import AppTransition from '@/components/ui/layout/transition/AppTransition';
import Header from '@/components/ui/layout/Header';
import WebsiteHeader from '@/components/website/ui/WebsiteHeader';
import AppHeader from '@/components/mystyc/ui/MystycHeader';
import Menu from '@/components/ui/layout/menu/Menu';
import ScrollWrapper from '@/components/ui/layout/scroll/ScrollWrapper';
import AdminSidebar from '@/components/admin/ui/AdminSidebar';
import PageTransition from '@/components/ui/layout/transition/PageTransition';
import Main from '@/components/ui/layout/Main';
import Footer from '@/components/ui/layout/Footer';
import WebsiteFooter from '@/components/website/ui/WebsiteFooter';
import AppFooter from '@/components/mystyc/ui/MystycFooter';
import ServerLogoutForm from '@/components/auth/ServerLogoutForm';
import GlobalError from '@/components/ui/layout/GlobalError';
import Offline from '@/components/ui/layout/Offline';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useUser();
  const isWebsite = !user;
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useAppStore((s) => s.setSidebarCollapsed);
  const isGlobalError = useAppStore((state) => state.isGlobalError);
  const setOnline = useAppStore((state) => state.setOnline);  
  const isOnline = useAppStore((state) => state.isOnline);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    registerVisit({
      deviceInfo: getDeviceInfo(),
      pathname,
      clientTimestamp: new Date().toISOString()
    }).catch(err => {
      logger.error('Analytics error:', err);
    });
  }, [pathname])  

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    // Set initial state
    setOnline(navigator.onLine);

    // Listen for changes
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline]);  

  // Close menu when pathname changes
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);


  const isAdminPath = pathname.startsWith('/admin');  
  const isAdmin = user && user.isAdmin && isAdminPath;

  const header = isWebsite ? <WebsiteHeader /> : <AppHeader menuOpen={menuOpen} setMenuOpen={setMenuOpen} />;
  const menu = isWebsite ? null : <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />;
  const sidebar = isAdmin ? <AdminSidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} /> : null;
  const footer = isWebsite ? <WebsiteFooter /> : <AppFooter />;

  let content;
  if (isGlobalError) {
    content = <GlobalError />;
  } else if (!isOnline) {
    content = <Offline />;
  } else {
    content = (
      <div className="flex flex-1">
        {sidebar}
        <PageTransition>
          <Main>{children}</Main>
        </PageTransition>
      </div>
    );
  }

  return (
    <>
      <TransitionProvider>
        <AppTransition>
          <Header isFullWidth={isAdmin == true} isPlus={(user && user.isPlus) === true}>{header}</Header>
          {menu}  
          <ScrollWrapper>
            {content}
            <Footer>{footer}</Footer>
          </ScrollWrapper>
        </AppTransition>
      </TransitionProvider>
      <ServerLogoutForm />
    </>
  );  
}