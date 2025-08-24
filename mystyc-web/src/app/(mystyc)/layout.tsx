'use client'

import { useEffect } from 'react';

import { useUser } from '@/components/ui/context/AppContext';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import Main from '@/components/ui/layout/Main';
import MystycFooter from "@/components/mystyc/MystycFooter";

export default function Layout({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const router = useTransitionRouter();

console.log('Mystyc Layout rendered - user:', user);

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
      <div className='fixed bottom-0 left-0 w-full'>
        <MystycFooter user={user} />
      </div>
    </>
  );
}