'use client';

import { useEffect } from 'react';
import { useUser } from '@/components/context/AppContext';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useUser();
  const router = useTransitionRouter();

  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

  if (user) {
    return null;
  }

  return <>{children}</>;
}