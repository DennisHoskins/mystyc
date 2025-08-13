'use client'

import { useEffect } from 'react';

import { useUser } from '@/components/ui/context/AppContext';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import AdminLayout from '@/components/admin/AdminLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const router = useTransitionRouter();

  useEffect(() => {
    if (!user || !user.isAdmin) router.replace('/', false);
  }, [user, router]);

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  );
}