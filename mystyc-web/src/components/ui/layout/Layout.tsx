'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { apiClient } from '@/api/apiClient';
import { useAppStore } from '@/store/appStore';
import { useUser } from '@/components/ui/layout/context/AppContext';
import { TransitionProvider } from '@/components/ui/layout/context/TransitionContext';

import AppTransition from '@/components/ui/layout/transition/AppTransition';
import WebsiteHeader from '@/components/website/WebsiteHeader';
import AppHeader from '@/components/mystyc/MystycHeader';
import ScrollWrapper from '@/components/ui/layout/scroll/ScrollWrapper';
import PageTransition from '@/components/ui/layout/transition/PageTransition';
import Header from '@/components/ui/layout/Header';
import Menu from '@/components/ui/layout/menu/Menu';
import Main from '@/components/ui/layout/Main';
import Footer from '@/components/ui/layout/Footer';
import WebsiteFooter from '@/components/website/WebsiteFooter';
import AppFooter from '@/components/mystyc/MystycFooter';
import ServerLogoutForm from '@/components/auth/ServerLogoutForm';
import GlobalError from '@/components/ui/layout/GlobalError';
import Offline from '@/components/ui/layout/Offline';
import AdminSidebar from '@/components/mystyc/admin/ui/AdminSidebar';
import { logger } from '@/util/logger'

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

  logger.log("");
  logger.log("mystyc: v2025-07-04:12:00");
  logger.log("");

  useEffect(() => {
    apiClient.registerVisit(pathname)
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

  const FooterContent = isWebsite ? WebsiteFooter : AppFooter;

  const isAdminPath = pathname.startsWith('/admin');  
  const isAdmin = user && user.isAdmin && isAdminPath;

  if (pathname.startsWith("/logout")) {
    return (
      <TransitionProvider>
        <AppTransition>
          <PageTransition>
            {children}
          </PageTransition>
        </AppTransition>
      </TransitionProvider>
    );
  }

  return (
    <>
      <TransitionProvider>
        <AppTransition>

          <Header isFullWidth={isAdmin == true}>
            {isWebsite
              ? <WebsiteHeader />
              : <AppHeader menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
            }            
          </Header>

          {!isWebsite && (
            <Menu 
              isOpen={menuOpen} 
              onClose={() => setMenuOpen(false)}
            />
          )}

          <div className="flex flex-1 w-full h-fit">
            <ScrollWrapper>
              {
                isGlobalError ? <GlobalError /> :
                !isOnline ? <Offline /> :
                (
                  <>
                    {isAdmin && 
                      <AdminSidebar 
                        isCollapsed={sidebarCollapsed}
                        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                      /> 
                    }
                    
                    <div className={`transition-all duration-300 ease-in-out flex flex-col flex-1 ${isAdmin ? `md:ml-28 ${sidebarCollapsed ? 'lg:ml-28' : 'lg:ml-80'}` : ''}`}>
                      <PageTransition>
                        <Main>{children}</Main>
                      </PageTransition>
                    </div>

                  </>
                )
              }
              <Footer><FooterContent /></Footer>
            </ScrollWrapper>
          </div>

        </AppTransition>
      </TransitionProvider>
      <ServerLogoutForm />
    </>
  );  
}