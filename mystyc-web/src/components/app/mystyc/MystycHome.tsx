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
    <div className="flex flex-1 items-center justify-center mx-4">
      <div className="w-full max-w-md text-center mx-4 px-6 border rounded-md p-6 shadow-sm bg-white">
        {user.isOnboard ? <Dashboard /> : <Welcome />}
      </div>
    </div>
  );
}
