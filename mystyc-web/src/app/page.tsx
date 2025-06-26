'use client';

import { useEffect } from 'react';
import { useUser, useBusy, useAuthenticated } from '@/components/layout/context/AppContext';
import Mystyc from './(mystyc)/mystyc';
import Home from './(website)/home';

export default function Page() {
  const user = useUser();
  const authenticated = useAuthenticated();
  const { setBusy } = useBusy();

  useEffect(() => {
    setBusy(false);
  }, [setBusy])

  return (
    <>
      { (user) ? <Mystyc /> : <Home /> }
    </>
  );
}