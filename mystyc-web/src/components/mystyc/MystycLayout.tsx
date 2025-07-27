'use client'

import { useEffect } from 'react';

import { useUser } from '@/components/ui/layout/context/AppContext';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import MystycHeader from '@/components/mystyc/ui/MystycHeader';
import PageTransition from '@/components/ui/layout/transition/PageTransition';
import Main from '@/components/ui/layout/Main';
import Footer from '@/components/ui/layout/Footer';
import MystycFooter from '@/components/mystyc/ui/MystycFooter';

export default function MystycLayout({ sidebar, children, className } : {
  sidebar?: React.ReactNode | null | undefined,
  children: React.ReactNode,
  className?: string | null
}) {
  const user = useUser();
  const router = useTransitionRouter();

  useEffect(() => {
    if (!user || !user.isAdmin) {
      router.replace('/', false);
    }
  }, [user, router]);

  return (
    <>
      <MystycHeader className={className} user={user} />
      <div className={`flex grow w-full min-h-0 ${className ? className : 'max-w-content'}`}>
        {sidebar}
        <PageTransition>
          <Main>
            {children}
          </Main>
        </PageTransition>
      </div>
      <Footer><MystycFooter /></Footer>
    </>
  );
}
