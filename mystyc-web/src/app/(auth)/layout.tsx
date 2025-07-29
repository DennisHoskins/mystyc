'use client'

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useInitialized, useUser } from '@/components/ui/layout/context/AppContext';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import WebsiteHeader from "@/components/website/WebsiteHeader";
import MystycHeader from "@/components/mystyc/MystycHeader";
import AppTransition from "@/components/ui/layout/transition/AppTransition";
import Card from '@/components/ui/Card';
import AppLogo from '@/components/ui/AppLogo';
import WebsiteFooter from "@/components/website/WebsiteFooter";
import MystycFooter from "@/components/mystyc/MystycFooter";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const user = useUser();
  const initialized = useInitialized();
  const router = useTransitionRouter();
  const [isAuth, setIsAuth] = useState(false);
  const isLogout = pathname === '/logout';

  useEffect(() => {
    if (!initialized) return;
    if (isLogout) return;
    setIsAuth(user == null);
    if (user && !isAuth) router.replace('/', false);
  }, [initialized, isLogout, isAuth, user, router]);

  const showContent = initialized && (!user && isAuth);

  return (
    <>
      {user ? <MystycHeader user={user} /> : <WebsiteHeader /> }
      <AppTransition>
        <div className='flex-1 flex flex-col justify-center items-center w-full p-4 -mt-20'>
          {isLogout ? (
            <>{children}</>
          ) : (showContent && (
            <Card className='w-full max-w-lg text-center flex flex-col space-y-6 m-4 p-6'>
              <AppLogo scale={1.2} className='mt-6' />
              {children}
            </Card>
          ))}
        </div>
      </AppTransition>
      {user ? <MystycFooter user={user} /> : <WebsiteFooter /> }
    </>      
  );
}
