'use client'

import { useEffect } from 'react';

import { useAppStore } from '@/store/appStore';
import { useUser } from '@/components/ui/layout/context/AppContext';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import AdminSidebar from '@/components/admin/ui/AdminSidebar';
import MystycLayout from '../mystyc/MystycLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const router = useTransitionRouter();
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useAppStore((s) => s.setSidebarCollapsed);

  useEffect(() => {
    if (!user || !user.isAdmin) {
      router.replace('/', false);
    }
  }, [user, router]);

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <MystycLayout
      className='w-full'
      sidebar={
        <AdminSidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      }
    >
      {children}
    </MystycLayout>
  );
}
