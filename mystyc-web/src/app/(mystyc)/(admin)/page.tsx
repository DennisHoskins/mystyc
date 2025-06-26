'use client';

import { useUser } from '@/components/layout/context/AppContext';

export default function Page() {
  const user = useUser();

  if (!user || !user.isAdmin) {
    return null;
  }

  return <></>
}