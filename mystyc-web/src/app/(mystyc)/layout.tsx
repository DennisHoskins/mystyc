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
      <div className='flex w-full h-[var(--client-height)] -mt-[59px] max-w-content self-center'>
        <Main className='relative z-20 flex w-full justify-center mt-14 mb-12 p-10 pb-0'>
          {children}
        </Main>
      </div>
      <div className='fixed z-40 bottom-0 left-0 w-full'>
        <MystycFooter user={user} />
      </div>
    </>
  );
}