'use client'

import { AppUser } from '@/interfaces/app/app-user.interface';
import AppLogo from '@/components/ui/AppLogo';
import Link from '@/components/ui/Link';

interface HeaderProps {
  children?: React.ReactNode | null;
  user?: AppUser | null;
  className?: string | null;
}

export default function Header({ children, user, className }: HeaderProps) {
  return (
    <header className="flex w-full bg-white px-4 py-3 shadow-sm relative z-[70]">
      <nav className={`flex w-full ${className ? className : 'max-w-content'} mx-auto items-center`}>
        <Link href="/" className="flex items-center">
          <AppLogo orientation="horizontal" showText isPlus={user?.isPlus} />
        </Link>
        <div className="flex space-x-4 ml-auto">
          {children}
        </div>
      </nav>
    </header>
  );
}