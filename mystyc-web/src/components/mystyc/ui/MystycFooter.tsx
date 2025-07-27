'use client';

import { useUser } from '@/components/ui/layout/context/AppContext';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';

export default function MystycFooter() {
  const router = useTransitionRouter();
  const user = useUser();
  if (!user) {
    return;
  }

  const handleAdminClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/admin')    
  }

  return (
    <>
    {user.isAdmin && (
        <>
          {' · '}
          <a            
            href="/admin"
            onClick={handleAdminClick}
            className="ml-1 underline hover:text-gray-700"
          >
            Admin
          </a>
        </>
    )}
    </>
  );
}
