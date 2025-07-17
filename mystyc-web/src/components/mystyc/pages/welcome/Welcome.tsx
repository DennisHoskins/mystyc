'use client';

import { useUser } from '@/components/ui/layout/context/AppContext';

export default function Welcome() {
  const user = useUser();
  if (!user) {
    return;
  }

  return (
    <div className="flex-1 flex items-center justify-center w-64 h-64">
      Welcome to Mystyc!
    </div>
  );
};

