'use client'

import { useEffect } from 'react';

import { useUser } from '@/components/ui/layout/context/AppContext';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import PageTransition from '@/components/ui/layout/transition/PageTransition';
import Main from '@/components/ui/layout/Main';
import MystycHeader from "@/components/mystyc/MystycHeader";
import AppTransition from "@/components/ui/layout/transition/AppTransition";
import MystycFooter from "@/components/mystyc/MystycFooter";

export default function Layout({ children}: { children: React.ReactNode }) {
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
      <MystycHeader user={user} />
      <AppTransition>
        <div className='flex grow w-full min-h-0 max-w-content self-center'>
          <PageTransition>
            <Main>
              {children}
            </Main>
          </PageTransition>
        </div>
      </AppTransition> 
      <MystycFooter user={user} />
    </>
  );
}