'use client';

import { useEffect } from 'react';
import { useUser } from '@/components/layout/context/AppContext';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';

export default function MystycAdminLayout({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const router = useTransitionRouter();

  useEffect(() => {
    if (!user || !user.isAdmin) {
      router.replace('/', false);
    }
  }, [user, router]);

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <div className='px-4 md:pl-0 py-4'>
      {children}
    </div>
  );
}