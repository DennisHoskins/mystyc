'use client';

import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import AppLogo from '@/components/ui/AppLogo';

interface HeaderProps {
  children: React.ReactNode;
  isFullWidth?: boolean;
}

export default function Header({ children, isFullWidth = false }: HeaderProps) {
  const router = useTransitionRouter();

  return (
    <header className="flex w-full bg-white px-4 py-3 shadow-sm relative z-[70]">

      <nav className={`flex w-full ${!isFullWidth ? 'max-w-content' : ''} mx-auto items-center`}>
        <button onClick={() => router.push('/')} className="flex items-center">
          <AppLogo orientation="horizontal" showText />
        </button>

        <div className="flex space-x-4 ml-auto">
          {children}
        </div>
      </nav>

    </header>
  );
}