'use client';

import { useUser } from '@/components/context/AppContext';
import Mystyc from '@/app/(mystyc)/mystyc';
import Home from '@/app/(website)/home';

export default function Page() {
  const user = useUser();

  console.log("")
  console.log("ROOT")
  console.log("")

  return user ? <Mystyc /> : <Home />;
}