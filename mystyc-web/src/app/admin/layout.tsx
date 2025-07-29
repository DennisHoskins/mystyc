'use client'

import { useEffect } from 'react';

import { useAppStore } from '@/store/appStore';
import { useUser } from '@/components/ui/layout/context/AppContext';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import AdminHeader from "@/components/admin/AdminHeader";
import AppTransition from '@/components/ui/layout/transition/AppTransition';
import AdminFooter from "@/components/admin/AdminFooter";
import AdminSidebar from '@/components/admin/ui/AdminSidebar';

export default function Layout({ children}: { children: React.ReactNode }) {
  const user = useUser();
  const router = useTransitionRouter();
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useAppStore((s) => s.setSidebarCollapsed);

  useEffect(() => {
    if (!user || !user.isAdmin) router.replace('/', false);
  }, [user, router]);

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <>
      <AdminHeader user={user} />
      <AppTransition>
        <div className='flex-1 flex flex-col w-full h-full overflow-hidden'>
          <div className='flex-1 flex flex-col w-full overflow-auto'>
            <div className='flex flex-row w-full flex-grow'>
              <AdminSidebar 
                isCollapsed={sidebarCollapsed} 
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
              {children}
            </div>
            <AdminFooter />
          </div>
        </div>
      </AppTransition>
    </>
  );
}