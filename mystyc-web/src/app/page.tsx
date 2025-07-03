'use client';

import { useEffect } from 'react';
// import { useUser, useBusy } from '@/components/layout/context/AppContext';
import { useBusy } from '@/components/layout/context/AppContext';
// import Mystyc from './(mystyc)/mystyc';
import WebsiteHome from "@/components/app/website/WebsiteHome";

export default function Page() {
  // const user = useUser();
  const { setBusy } = useBusy();

  useEffect(() => {
    setBusy(false);
  }, [setBusy])

  return (
    <WebsiteHome />
    // <>
    //   { (user) ? <Mystyc /> : <WebsiteHome /> }
    // </>
  );
}