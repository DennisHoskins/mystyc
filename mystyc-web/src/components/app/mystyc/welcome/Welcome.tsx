'use client';

import { useUser } from '@/components/layout/context/AppContext';

export default function Welcome() {
  const user = useUser();
  if (!user) {
    return;
  }

  return (
    <div className="flex items-center justify-center w-64 h-64">
      Welcome to Mystyc!
    </div>
  );
};

