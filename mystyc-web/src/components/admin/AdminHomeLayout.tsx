'use client'

import { useAppStore } from '@/store/appStore';
import AdminFooter from "@/components/admin/AdminFooter";
import AdminSidebar from '@/components/admin/ui/AdminSidebar';
import ScrollWrapper from '@/components/ui/layout/scroll/ScrollWrapper';

export default function AdminHomeLayout({ children }: { children: React.ReactNode }) {
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useAppStore((s) => s.setSidebarCollapsed);

  return (
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
  );
}