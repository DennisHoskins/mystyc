'use client'

import { useAppStore } from '@/store/appStore';
import AdminFooter from "@/components/admin/AdminFooter";
import AdminSidebar from '@/components/admin/ui/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useAppStore((s) => s.setSidebarCollapsed);

  return (
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
  );
}