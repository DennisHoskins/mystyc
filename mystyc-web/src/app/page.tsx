'use client';

import { useApp } from '@/components/context/AppContext';
import Home from '@/app/(website)/home';
import Mystyc from '@/app/(mystyc)/mystyc';

export default function Root() {
  const { app } = useApp();

  return app && app.user ? <Mystyc /> : <Home />;
}
