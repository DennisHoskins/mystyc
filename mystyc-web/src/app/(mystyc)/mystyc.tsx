'use client';

import { useEffect, useState } from 'react';

import { useUser } from '@/components/layout/context/AppContext';
import { useAppStore } from '@/store/appStore';
import { useFirebaseMessaging } from '@/hooks/useFirebaseMessaging';
import MystycHome from '@/components/app/mystyc/MystycHome';
import Text from '@/components/ui/Text';

export default function Mystyc() {
  const { fcmToken } = useAppStore();
  const [token, setToken] = useState<string | null>(null);
  const user = useUser();

  useFirebaseMessaging();

  useEffect(() => {
    setToken(fcmToken);
  }, [fcmToken])

  if (!user) {
    return null;
  }

  return (
    <>
      {user && user.device && user.device.fcmToken && <Text>User Token: {user.device.fcmToken}</Text>}
      <Text>Firebase Token: {token}</Text>
      <MystycHome />
    </>
  );
}
