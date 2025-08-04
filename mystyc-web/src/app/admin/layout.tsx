'use client'

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { useUser } from '@/components/ui/context/AppContext';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import AdminHomeLayout from '@/components/admin/AdminHomeLayout';
import AdminLayout from '@/components/admin/AdminLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useUser();
  const router = useTransitionRouter();
  const isAdminHome = pathname === '/admin';

  useEffect(() => {
    if (!user || !user.isAdmin) router.replace('/', false);
  }, [user, router]);

  if (!user || !user.isAdmin) {
    return null;
  }

  const Layout = isAdminHome ? AdminHomeLayout : AdminLayout;

  return (
    <Layout>
      {children}
    </Layout>
  );
}