'use client';

import Link from 'next/link';
import { useAuth } from '@/components/context/AuthContext';
import { isUserAdmin } from '@/auth/util';
import { useCustomRouter } from '@/hooks/useCustomRouter';

function MobileNav() {
  const router = useCustomRouter();
  const { user } = useAuth();
  const showAdmin = isUserAdmin(user?.userProfile);
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t md:hidden">
      <div className="mx-auto max-w-7xl flex justify-around py-2">
        <button onClick={() => router.push('/')} className="text-sm font-medium">
          Home
        </button>
        <button onClick={() => router.push('/answers')} className="text-sm font-medium">
          Answers
        </button>
        <button onClick={() => router.push('/profile')} className="text-sm font-medium">
          Profile
        </button>
        {showAdmin && (
         <button onClick={() => router.push('/admin')} className="text-sm font-medium">
           Admin
         </button>
       )}        
      </div>
    </nav>
  );
}

export default function FooterUser() {
  const { user } = useAuth();
  return (
    <>
      <MobileNav />
      <footer className="hidden md:flex w-full border-t bg-white px-4 py-3 items-center justify-between text-sm text-gray-500">
        <span>© {new Date().getFullYear()} mystyc</span>
        {isUserAdmin(user?.userProfile) && (
          <Link href="/admin" className="underline hover:text-gray-700">
            Admin
          </Link>
        )}
      </footer>
    </>
  );
}
