'use client'

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { useAppStore } from '@/store/appStore';
import { useUser } from '@/components/ui/layout/context/AppContext';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import AdminHeader from "@/components/admin/AdminHeader";
import AdminFooter from "@/components/admin/AdminFooter";
import AdminSidebar from '@/components/admin/ui/AdminSidebar';
import ScrollWrapper from '@/components/ui/layout/scroll/ScrollWrapper';

export default function Layout({ children}: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useUser();
  const router = useTransitionRouter();
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useAppStore((s) => s.setSidebarCollapsed);

  const isAdminHome = pathname === '/admin';

  useEffect(() => {
    if (!user || !user.isAdmin) router.replace('/', false);
  }, [user, router]);

  if (!user || !user.isAdmin) {
    return null;
  }

  if (isAdminHome) {
    return (
      <>
        <AdminHeader user={user} />
        <div className='flex-1 flex flex-col w-full h-full overflow-hidden'>
          <ScrollWrapper>
            <div className='flex flex-row w-full flex-grow'>
              <AdminSidebar 
                isCollapsed={sidebarCollapsed} 
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
              {children}
            </div>
            <AdminFooter />
          </ScrollWrapper>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader user={user} />
      <div className='flex-1 flex flex-col w-full h-full overflow-hidden'>
        <div className='flex flex-row flex-1 w-full min-h-0'>
          <AdminSidebar 
            isCollapsed={sidebarCollapsed} 
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          <div className='flex-1 h-full flex flex-col min-h-0'>
            {children}
          </div>
        </div>
        <AdminFooter />
      </div>
    </>
  );
}