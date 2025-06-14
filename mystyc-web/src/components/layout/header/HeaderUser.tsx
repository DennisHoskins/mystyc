'use client';

import { useAuth } from '@/hooks/useAuth';
import { useCustomRouter } from '@/hooks/useCustomRouter';
import { useApp } from '@/components/context/AppContext';
import AppLogo from '@/components/layout/AppLogo';
import Button from '@/components/ui/Button';

/* Desktop navigation (md+): logo, centered links, admin logout on far right */
function DesktopNav() {
  const router = useCustomRouter();
  const { app } = useApp();

  if (!app || !app.user) {
    return;
  }

  return (
    <nav className="hidden md:flex w-full bg-white sticky top-0 z-10 px-4 py-3">
      <div className="flex w-full items-center">
        {/* Logo on the far left */}
        <button onClick={() => router.push('/')} className="flex items-center">
          <AppLogo orientation="horizontal" showText={false} />
        </button>

        {/* Centered nav links */}
        <div className="flex flex-1 justify-center space-x-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="text-sm font-medium hover:underline"
          >
            Home
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push('/answers')}
            className="text-sm font-medium hover:underline"
          >
            Answers
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push('/profile')}
            className="text-sm font-medium hover:underline"
          >
            Profile
          </Button>
        </div>

        {app.user.isAdmin && (
          <Button
            variant="ghost"
            onClick={() => router.push('/logout')}
            className="text-sm text-red-600 hover:underline"
          >
            Logout
          </Button>
        )}
      </div>
    </nav>
  );
}

/* Mobile header (<md): logo and logout, scrollable header—no border */
function MobileHeader() {
  const router = useCustomRouter();
  const { signOut } = useAuth();
  const { app } = useApp();

  if (!app || !app.user) {
    return;
  }

  return (
    <header className="md:hidden w-full bg-white px-4 py-3">
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        <button onClick={() => router.push('/')} className="flex items-center">
          <AppLogo orientation="horizontal" showText />
        </button>
        {app.user.isAdmin && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut()}
          >
            Logout
          </Button>
        )}
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
