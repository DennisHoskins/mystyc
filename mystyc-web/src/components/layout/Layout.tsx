'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { useAppStore } from '@/store/appStore';
import { useUser, useClearUser, useAuthenticated } from '@/components/layout/context/AppContext';
import { TransitionProvider } from '@/components/layout/context/TransitionContext';
import StateTransition from '@/components/layout/transition/StateTransition';
import WebsiteHeader from '@/components/app/website/WebsiteHeader';
import AppHeader from '@/components/app/mystyc/MystycHeader';

import ScrollWrapper from '@/components/layout/scroll/ScrollWrapper';
import PageTransition from '@/components/layout/transition/PageTransition';
import Main from '@/components/layout/Main';
import WebsiteFooter from '@/components/app/website/WebsiteFooter';
import AppFooter from '@/components/app/mystyc/MystycFooter';
import Modal from '@/components/ui/modal/Modal';
import ServerLogoutForm from '@/components/app/auth/ServerLogoutForm';
import GlobalError from '@/components/layout/GlobalError';
import Offline from '@/components/layout/Offline';
import { logger } from '@/util/logger';

import AdminSidebar from '@/components/app/mystyc/admin/ui/AdminSidebar';
import { apiClient } from '@/api/apiClient';

export default function Layout({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const clearUser = useClearUser();
  const authenticated = useAuthenticated();
  const isLoggedOutByServer = useAppStore((s) => s.isLoggedOutByServer);
  const setLoggedOutByServer = useAppStore((s) => s.setLoggedOutByServer);
  const pathname = usePathname();
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

  const Header = isWebsite ? WebsiteHeader : AppHeader;
  const Footer = isWebsite ? WebsiteFooter : AppFooter;

  useEffect(() => {
    if (!user && authenticated) {
      const logout = async () => {
        await apiClient.serverLogout()
        clearUser();
      };

      setLoggedOutByServer(true);
      logout();

      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
  }, [user, authenticated, clearUser, setLoggedOutByServer]);

  const isAdminPath = pathname.startsWith('/admin');  
  const isAdmin = user && user.isAdmin && isAdminPath;

  return (
    <>
      <TransitionProvider>
        <StateTransition>

          <Header />

          <div className="flex flex-1 w-full h-fit">
            <ScrollWrapper>
              {
                isGlobalError ? <GlobalError /> :
                !isOnline ? <Offline /> :
                (
                  <>
                    {isAdmin && 
                      <AdminSidebar 
                        isOpen={isAdmin} 
                        isCollapsed={sidebarCollapsed}
                        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
                      /> 
                    }
                    
                    <div className={`transition-all duration-300 ease-in-out flex flex-col flex-1 ${isAdmin ? (sidebarCollapsed ? 'ml-28' : 'ml-80') : ''}`}>
                      <PageTransition>
                        <Main>{children}</Main>
                      </PageTransition>
                    </div>

                  </>
                )
              }
              <Footer />
            </ScrollWrapper>
          </div>

        </StateTransition>
      </TransitionProvider>
      
      <Modal isOpen={isLoggedOutByServer}>
        <ServerLogoutForm />
      </Modal>
    </>
  );  
}