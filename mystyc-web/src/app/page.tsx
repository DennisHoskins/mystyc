'use client'

import { useApp } from '@/components/context/AppContext';

import MystycLayout from '@/app/(mystyc)/layout';
import Mystyc from '@/app/(mystyc)/mystyc';
import HomeLayout from '@/app/(website)/layout';
import Home from '@/app/(website)/home';

export default function Root() {
  const { app } = useApp();

  return (
    <>
      {app && app.user ? (
        <MystycLayout>
          <Mystyc />
        </MystycLayout>
      ) : (
        <HomeLayout>
          <Home />
        </HomeLayout>        
      )}
    </>
  );
}