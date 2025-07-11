'use client';

import { useEffect } from 'react';
import { useUser } from '@/components/ui/layout/context/AppContext';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';

export default function MystycLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useUser();
  const router = useTransitionRouter();

  useEffect(() => {
    if (!user || !user.isOnboard) {
      router.replace('/', false);
    }
  }, [user, router]);

  if (!user || !user.isOnboard) {
    return null;
  }

  return <>{children}</>;
}