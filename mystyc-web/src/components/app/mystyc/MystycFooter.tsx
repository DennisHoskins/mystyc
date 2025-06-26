'use client';

import { useUser } from '@/components/layout/context/AppContext';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';

export default function AppFooter() {
  const router = useTransitionRouter();
  const user = useUser();
  if (!user) return;

  return (
    <footer className="flex w-full border-t bg-white px-4 py-3 text-center text-sm text-gray-500">
      <div className="flex w-full max-w-6xl mx-auto justify-center items-center">
        <span>
          © {new Date().getFullYear()} mystyc
          {user.isAdmin && (
            <>
              {' · '}
              <a            
                href="/admin"
                onClick={() => router.push('/admin')}
                className="ml-1 underline hover:text-gray-700"
              >
                Admin
              </a>
            </>
          )}
        </span>
      </div>
    </footer>
  );
}
