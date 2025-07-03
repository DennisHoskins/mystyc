'use client';

import { useUser } from '@/components/layout/context/AppContext';

import Section from '@/components/ui/Section';
import Card from '@/components/ui/Card';
import Dashboard from '@/components/app/mystyc/dashboard/Dashboard';
import Welcome from '@/components/app/mystyc/welcome/Welcome';

export default function Mystyc() {
  const user = useUser();
  if (!user) {
    return null;
  }

  return (
    
    <Section className='flex flex-1 h-full items-center'>
      <Card>
        {user.isOnboard ? <Dashboard /> : <Welcome />}
      </Card>
    </Section>
  );
}
