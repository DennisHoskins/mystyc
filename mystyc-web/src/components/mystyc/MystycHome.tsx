'use client';

import { useUser } from '@/components/ui/layout/context/AppContext';

import Dashboard from '@/components/mystyc/pages/dashboard/Dashboard';
import Welcome from '@/components/mystyc/pages/welcome/Welcome';

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
