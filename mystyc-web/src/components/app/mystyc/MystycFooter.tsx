'use client';

import { useUser } from '@/components/layout/context/AppContext';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';

import Text from '@/components/ui/Text';

export default function AppFooter() {
  const router = useTransitionRouter();
  const user = useUser();
  if (!user) return;

  const handleAdminClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/admin')    
  }

  return (
    <footer className="flex w-full bg-gray-300 px-4 py-3 text-center text-sm text-gray-500">
      <div className="flex w-full max-w-content mx-auto justify-center items-center">
        <span>
          <Text>
            © {new Date().getFullYear()} mystyc
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
          </Text>
        </span>
      </div>
    </footer>
  );
}
