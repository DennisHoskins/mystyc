'use client'

import { useApp } from '@/components/context/AppContext';

import Mystyc from '@/app/(mystyc)/mystyc';
import Home from '@/app/(website)/home';

export default function Root() {
  const { app } = useApp();

  return (
    <>
      {app && app.user ? (
        <Mystyc />
      ) : (
        <Home />
      )}
    </>
  );
}