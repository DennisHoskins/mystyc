'use client'

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useUser } from '../context/AppContext';
import AppLogo from '@/components/ui/AppLogo';
import Link from '@/components/ui/Link';
import WebsiteHeader from '@/components/website/WebsiteHeader';
import MystycHeader from '@/components/mystyc/MystycHeader';

export default function Header() {
  const user = useUser();
  const pathname = usePathname();
  const [className, setClassName] = useState("max-w-content");

  useEffect(() => {
    if (pathname.startsWith("/admin")) setClassName("max-w-full");
    else setClassName("max-w-[80rem]");
  }, [pathname, setClassName]);

  return (
    <header className="flex w-full bg-white px-4 py-3 shadow-sm relative z-[50]">
      <nav className={`flex w-full mx-auto items-center ${className} transition-[max-width] duration-300 ease-in-out`}>
        <Link href="/" className="flex items-center hover:!no-underline">
          <AppLogo orientation="horizontal" showText user={user} />
        </Link>
        <div className="flex space-x-4 ml-auto">
          {user
            ? <MystycHeader />
            : <WebsiteHeader />
          }
        </div>
      </nav>
    </header>
  );
}