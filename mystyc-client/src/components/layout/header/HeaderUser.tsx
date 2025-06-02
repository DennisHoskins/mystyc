'use client';

import Link from 'next/link';
import { useCustomRouter } from '@/hooks/useCustomRouter';
import { useAuth } from '@/components/context/AuthContext';
import AppLogo from '@/components/layout/AppLogo';

function DesktopNav() {
  const router = useCustomRouter();
  const { signOut } = useAuth();

  return (
    <nav className="hidden md:flex w-full bg-white border-b sticky top-0 z-10 px-4 py-3">
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center">
            <AppLogo orientation="horizontal" showText={false} />
          </Link>
          <button onClick={() => router.push('/')} className="text-sm font-medium hover:underline">
            Home
          </button>
          <button onClick={() => router.push('/answers')} className="text-sm font-medium hover:underline">
            Answers
          </button>
          <button onClick={() => router.push('/profile')} className="text-sm font-medium hover:underline">
            Profile
          </button>
          <button onClick={() => router.push('/subscription')} className="text-sm font-medium hover:underline">
            Subscription
          </button>
        </div>
        <button onClick={() => signOut()} className="text-sm font-medium text-red-600 hover:underline">
          Logout
        </button>
      </div>
    </nav>
  );
}

function MobileHeader() {
  const { signOut } = useAuth();

  return (
    <header className="md:hidden w-full bg-white border-b px-4 py-3">
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <AppLogo orientation="horizontal" showText />
        </Link>
        <button onClick={() => signOut()} className="text-sm font-medium text-red-600 hover:underline">
          Logout
        </button>
      </div>
    </header>
  );
}

export default function HeaderUser() {
  return (
    <>
      <MobileHeader />
      <DesktopNav />
    </>
  );
}
