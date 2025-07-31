'use client'

import { useEffect } from 'react';

import { useUser, useBusy } from '@/components/ui/context/AppContext';
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

  return <MystycHome user={user} />;
}