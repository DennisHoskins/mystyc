'use client';

import { useUser } from '@/components/layout/context/AppContext';

export default function Welcome() {
  const user = useUser();

  if (!user) {
    return;
  }

  return <>Welcome</>;
};

