'use client'

import { useEffect } from 'react';

import { useUser, useBusy } from '@/components/ui/layout/context/AppContext';
import PageTransition from '@/components/ui/layout/transition/PageTransition';
import MystycHome from "@/components/mystyc/MystycHome"

export default function Page() {
  const user = useUser();
  const { setBusy } = useBusy();

  useEffect(() => {
    setBusy(false);
  }, [setBusy])

  if (!user) {
    return null;
  }

  return (
    <PageTransition>
      <MystycHome user={user} />
    </PageTransition>      
  );
}