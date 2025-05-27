'use client';

import { useAuth } from '@/components/context/AuthContext';
import { isUserAdmin } from '@/auth/util';
import { useCustomRouter } from '@/hooks/useCustomRouter';

export default function Footer() {
  const { user } = useAuth();
  const router = useCustomRouter();

  const handleAdminClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push('/admin');
  };

  return (
    <footer className="w-full border-t bg-white px-4 py-3 text-center text-sm text-gray-500 animate-fade-in">
      © {new Date().getFullYear()} mystyc
      {isUserAdmin(user?.userProfile) && (
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
    </footer>
  );
}