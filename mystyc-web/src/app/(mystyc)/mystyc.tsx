'use client';

import { useUser } from '@/components/layout/context/AppContext';
import { useFirebaseMessaging } from '@/hooks/useFirebaseMessaging';
import MystycHome from '@/components/app/mystyc/MystycHome';

export default function Mystyc() {
  useFirebaseMessaging();

  const user = useUser();
  if (!user) {
    return null;
  }

  return <MystycHome />
}
