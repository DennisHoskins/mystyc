'use client'

import { useEffect } from 'react';

import { useUser } from '@/components/ui/context/AppContext';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import Main from '@/components/ui/layout/Main';
import MystycFooter from "@/components/mystyc/MystycFooter";

export default function Layout({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const router = useTransitionRouter();

  useEffect(() => {
    if (!user || !user.isAdmin) router.replace('/', false);
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <>
      <div className='flex grow w-full min-h-0 max-w-content self-center'>
        <Main>
          {children}
        </Main>
      </div>
      <MystycFooter user={user} />
    </>
  );
}