'use client';

import { useCustomRouter } from '@/hooks/useCustomRouter';
import { useApp } from '@/components/context/AppContext';
import { isUserAdmin } from '@/util/util';

/**
 * Fixed‐bottom mobile nav: visible only on <md
 */
function MobileNav() {
  const router = useCustomRouter();
  const { app } = useApp();
  const isAdmin = isUserAdmin(app?.user?.userProfile);

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t md:hidden">
      <div className="mx-auto max-w-7xl flex justify-around py-2">
        <button onClick={() => router.push('/')} className="text-sm">
          Home
        </button>
        <button onClick={() => router.push('/answers')} className="text-sm">
          Answers
        </button>
        <button onClick={() => router.push('/profile')} className="text-sm">
          Profile
        </button>
        {isAdmin && (
          <button onClick={() => router.push('/admin')} className="text-sm">
            Admin
          </button>
        )}
      </div>
    </nav>
  );
}

/**
 * Centered desktop footer: hidden on <md
 * Use plain buttons/text for consistent alignment
 */
function DesktopFooter() {
  const { app } = useApp();
  const router = useCustomRouter();
  const isAdmin = isUserAdmin(app?.user?.userProfile);

  return (
    <footer className="hidden md:flex w-full border-t bg-white px-4 py-3 text-sm text-gray-500">
      <div className="flex w-full justify-center space-x-4">
        <span>© {new Date().getFullYear()} mystyc</span>
        {isAdmin && (
          <button
            onClick={() => router.push('/admin')}
            className="underline hover:text-gray-700"
          >
            Admin
          </button>
        )}
      </div>
    </footer>
  );
}

export default function FooterUser() {
  return (
    <>
      <MobileNav />
      <DesktopFooter />
    </>
  );
}
