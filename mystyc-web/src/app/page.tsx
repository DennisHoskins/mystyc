'use client';

import { useUser } from '@/components/context/AppContext';
import Home from '@/app/(website)/home';
import Mystyc from '@/app/(mystyc)/mystyc';

export default function Page() {
  const user = useUser();

  return user ? <Mystyc /> : <Home />;
}