'use client';

import { useApp } from '@/components/context/AppContext';
import RootPage from '@/components/layout/RootPage';

export default function Page() {
  const { app } = useApp();

  return <RootPage user={app?.user || null} />
}