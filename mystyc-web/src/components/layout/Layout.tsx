'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { useAppStore } from '@/store/appStore';
import { logger } from '@/util/logger';

import { useUser } from '@/components/layout/context/AppContext';
import { TransitionProvider } from '@/components/layout/context/TransitionContext';
import AppTransition from '@/components/layout/transition/AppTransition';
import WebsiteHeader from '@/components/app/website/WebsiteHeader';
import AppHeader from '@/components/app/mystyc/MystycHeader';

import ScrollWrapper from '@/components/layout/scroll/ScrollWrapper';
import PageTransition from '@/components/layout/transition/PageTransition';
import Header from '@/components/layout/Header';
import Main from '@/components/layout/Main';
import Footer from '@/components/layout/Footer';
import WebsiteFooter from '@/components/app/website/WebsiteFooter';
import AppFooter from '@/components/app/mystyc/MystycFooter';
import Modal from '@/components/ui/modal/Modal';
import ServerLogoutForm from '@/components/app/auth/ServerLogoutForm';
import GlobalError from '@/components/layout/GlobalError';
import Offline from '@/components/layout/Offline';
import AdminSidebar from '@/components/app/mystyc/admin/ui/AdminSidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useUser();
  const isLoggedOutByServer = useAppStore((s) => s.isLoggedOutByServer);
  const isWebsite = !user;
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useAppStore((s) => s.setSidebarCollapsed);
  const isGlobalError = useAppStore((state) => state.isGlobalError);
  const setOnline = useAppStore((state) => state.setOnline);  
  const isOnline = useAppStore((state) => state.isOnline);

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

  useEffect(() => {
    logger.log('[LAYOUT] pathname', pathname);
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
              : <AppHeader />
            }            
          </Header>

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
      
      <Modal isOpen={isLoggedOutByServer}>
        <ServerLogoutForm />
      </Modal>
    </>
  );  
}