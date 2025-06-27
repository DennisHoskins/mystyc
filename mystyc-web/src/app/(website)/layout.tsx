'use client';

import { useEffect } from 'react';

import { useUser } from '@/components/layout/context/AppContext';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  const router = useTransitionRouter();
  const user = useUser();

  useEffect(() => {
    if (user) {
      router.replace("/", false);
    }
  }, [router, user])

  if (user) {
    return null;
  }

  return (
    {children}
  );
}
