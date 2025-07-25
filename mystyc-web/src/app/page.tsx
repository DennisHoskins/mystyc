'use client';

import { useEffect } from 'react';

import { useUser, useBusy } from '@/components/ui/layout/context/AppContext';
import WebsiteHome from "@/components/website/WebsiteHome";
import MystycHome from "@/components/mystyc/MystycHome"

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
    <MystycHome user={user} />
  );
}