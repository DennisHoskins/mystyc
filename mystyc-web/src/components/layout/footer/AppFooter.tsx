'use client';

import { useUser } from '@/components/context/AppContext';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';

export default function AppFooter() {
  const router = useTransitionRouter();
  const user = useUser();
  if (!user) return;

  return (
    <footer className="hidden md:flex w-full border-t bg-white px-4 py-3 text-center text-sm text-gray-500">
      <div className="flex w-full justify-center space-x-2">
        <span>
          © {new Date().getFullYear()} mystyc
          {user.isAdmin && (
            <button
              onClick={() => router.push('/admin')}
              className="underline hover:text-gray-700"
            >
              Admin
            </button>
          )}
        </span>
      </div>
    </footer>
  );
}
