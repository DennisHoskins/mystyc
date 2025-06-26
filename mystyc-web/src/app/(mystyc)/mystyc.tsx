'use client';

import { useUser } from '@/components/layout/context/AppContext';
import { useFirebaseMessaging } from '@/hooks/useFirebaseMessaging';
import Dashboard from '@/components/app/mystyc/dashboard/Dashboard';
import Welcome from '@/components/app/mystyc/welcome/Welcome';

export default function Mystyc() {
  useFirebaseMessaging();

  const user = useUser();
  if (!user) {
    return null;
  }

  return user.isOnboard ? <Dashboard /> : <Welcome />;
}
