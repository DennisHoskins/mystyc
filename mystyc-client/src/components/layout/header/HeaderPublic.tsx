'use client';

import Link from 'next/link';
import AppLogo from '@/components/layout/AppLogo';

export default function HeaderPublic() {
  return (
    <header className="w-full bg-white border-b px-4 py-3">
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <AppLogo orientation="horizontal" showText />
        </Link>
        <div className="space-x-4">
          <Link href="/login" className="text-sm font-medium hover:underline">
            Login
          </Link>
          <Link href="/signup" className="text-sm font-medium hover:underline">
            Signup
          </Link>
        </div>
      </div>
    </header>
  );
}
