'use client';

import { useState, useEffect, useCallback } from 'react';

import { apiClient } from '@/api/apiClient';
import { useUser } from '@/components/ui/layout/context/AppContext';
import { Content } from '@/interfaces/content.interface';
import Dashboard from '@/components/mystyc/pages/dashboard/Dashboard';
import Welcome from '@/components/mystyc/pages/welcome/Welcome';

export default function Mystyc() {
  const [data, setData] = useState<Content | null>(null);
  const user = useUser();

  const loadContent = useCallback(async () => {
    if (!user) {
      return;
    }
    const reply = await apiClient.getUserContent();
    setData(reply);
  }, [user]);

  useEffect(() => {
    loadContent();
  }, [loadContent])

  console.log(data);

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
