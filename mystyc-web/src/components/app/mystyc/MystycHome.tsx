'use client';

import { useUser } from '@/components/layout/context/AppContext';
import { useFirebaseMessaging } from '@/hooks/useFirebaseMessaging';
import Section from '@/components/ui/Section';
import Card from '@/components/ui/Card';
import Dashboard from '@/components/app/mystyc/dashboard/Dashboard';
import Welcome from '@/components/app/mystyc/welcome/Welcome';

export default function Mystyc() {
  useFirebaseMessaging();

  const user = useUser();
  if (!user) {
    return null;
  }

  return (
    <Section>
      <Card>
        {user.isOnboard ? <Dashboard /> : <Welcome />}
      </Card>
    </Section>
  );
}
