'use client';

import { useEffect } from 'react';
import { useUser, useBusy } from '@/components/ui/layout/context/AppContext';
import Mystyc from './(mystyc)/mystyc';
import WebsiteHome from "@/components/website/WebsiteHome";

export default function Page() {
  const user = useUser();
  const { setBusy } = useBusy();

  useEffect(() => {
    setBusy(false);
  }, [setBusy])

  if (!user) {
    return (
      <WebsiteHome />
    )
  }

  return (
    <Mystyc />
  );
}