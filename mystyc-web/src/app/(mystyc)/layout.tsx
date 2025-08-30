'use client'

import { useEffect } from 'react';

import { useUser } from '@/components/ui/context/AppContext';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import MystycLayout from '@/components/mystyc/MystycLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const router = useTransitionRouter();

  useEffect(() => {
    if (!user) router.replace('/', false);
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <MystycLayout>
      {children}
    </MystycLayout>
  );
}