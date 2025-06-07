'use client';

import { useCustomRouter } from '@/hooks/useCustomRouter';
import AppLogo from '@/components/layout/AppLogo';
import Button from '@/components/ui/Button';

export default function HeaderPublic() {
  const router = useCustomRouter();

  return (
    <header className="hidden md:flex w-full bg-white border-b px-4 py-3">
      <div className="flex w-full items-center">
        {/* Logo on the left */}
        <button onClick={() => router.push('/')} className="flex items-center">
          <AppLogo orientation="horizontal" showText />
        </button>

        {/* Centered nav links */}
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

        {/* Login/Signup on the right */}
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
      </div>
    </header>
  );
}
