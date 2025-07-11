'use client';

import { useUser } from '@/components/ui/layout/context/AppContext';
import { useFirebaseMessaging } from '@/hooks/useFirebaseMessaging';
import MystycHome from '@/components/mystyc/MystycHome';

export default function Mystyc() {
  useFirebaseMessaging();

  const user = useUser();
  if (!user) {
    return null;
  }

  return (
    <MystycHome />
  );
}
