'use client';

import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import AppLogo from '@/components/ui/AppLogo';
import Button from '@/components/ui/Button';

export default function WebsiteHeader() {
  const router = useTransitionRouter();

  return (
    <header className="flex w-full bg-white px-4 py-3">
      <nav className="flex w-full max-w-content mx-auto items-center">
        <button onClick={() => router.push('/')} className="flex items-center">
          <AppLogo orientation="horizontal" showText />
        </button>

        <div className="flex space-x-4 ml-auto">
          <Button
            variant="ghost"
            onClick={() => router.push('/login')}
            className="text-sm font-medium hover:underline"
          >
            Login
          </Button>
          <Button
            variant="primary"
            onClick={() => router.push('/register')}
            className="text-sm font-medium"
          >
            Sign Up
          </Button>
        </div>
      </nav>
    </header>
  );
}
