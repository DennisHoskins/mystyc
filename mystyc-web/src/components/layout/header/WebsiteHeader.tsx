'use client';

import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import AppLogo from '@/components/AppLogo';
import Button from '@/components/ui/Button';

export default function WebsiteHeader() {
  const router = useTransitionRouter();

  return (
    <header className="hidden md:flex w-full bg-white px-4 py-3">
      <nav className="flex w-full items-center">
        <button onClick={() => router.push('/')} className="flex items-center">
          <AppLogo orientation="horizontal" showText />
        </button>

        <div className="flex flex-1 justify-center space-x-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/features')}
            className="text-sm font-medium hover:underline"
          >
            Features
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push('/pricing')}
            className="text-sm font-medium hover:underline"
          >
            Pricing
          </Button>
        </div>

        <div className="flex space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/login')}
            className="text-sm font-medium hover:underline"
          >
            Login
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push('/register')}
            className="text-sm font-medium hover:underline"
          >
            Signup
          </Button>
        </div>
      </nav>
    </header>
  );
}
