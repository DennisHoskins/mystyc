'use client';

import { useUser } from '@/components/layout/context/AppContext';  
import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import AppLogo from '@/components/ui/AppLogo';
import Button from '@/components/ui/Button';

export default function AppHeader() {
  const user = useUser();
  const router = useTransitionRouter();

  return (
    <header className="flex w-full bg-white px-4 py-3">
      <nav className="flex w-full max-w-6xl mx-auto items-center">
        <button onClick={() => router.push('/')} className="flex items-center">
          <AppLogo orientation="horizontal" showText />
        </button>

        {user && user.isOnboard &&
          <div className="flex flex-1 justify-center space-x-8">
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
        }

        <div className="flex space-x-4 ml-auto">
          <Button
            variant="ghost"
            onClick={() => router.push('/logout')}
            className="text-sm font-medium hover:underline"
          >
            Logout
          </Button>
        </div>
      </nav>
    </header>
  );
}
