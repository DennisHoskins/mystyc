'use client';

import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/components/context/AppContext';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import AppLogo from '@/components/AppLogo';
import Button from '@/components/ui/Button';


/* Desktop navigation (md+): logo, centered links, admin logout on far right */
function DesktopNav() {
  const router = useTransitionRouter();
  const user = useUser();
  if (!user) return;

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

        {user.isAdmin && (
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
  const router = useTransitionRouter();
  const { signOut } = useAuth();
  const user = useUser();
  if (!user) return;

  return (
    <header className="md:hidden w-full bg-white px-4 py-3">
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        <button onClick={() => router.push('/')} className="flex items-center">
          <AppLogo orientation="horizontal" showText />
        </button>
        {user.isAdmin && (
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

export default function AppHeader() {
  return (
    <>
      <MobileHeader />
      <DesktopNav />
    </>
  );
}
