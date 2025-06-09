'use client';

import { useApp } from '@/components/context/AppContext';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { app } = useApp();
  
  useEffect(() => {
    if (app?.user && !app.user.userProfile?.roles?.includes('admin')) {
      redirect('/');
    }
  }, [app]);

  if (!app?.user?.userProfile?.roles?.includes('admin')) {
    return null; // or loading spinner
  }

  return <>{children}</>;
}