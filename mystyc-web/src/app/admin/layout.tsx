'use client';

import { useEffect } from 'react';

import { useUser } from '@/components/ui/layout/context/AppContext';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
    <>
      <div className='flex flex-col grow w-full min-h-0 overflow-hidden'>
        {children}
      </div>
    </>
  );
}
