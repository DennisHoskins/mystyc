'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useUser } from '@/components/context/AppContext';
import { useTransitions } from '@/components/context/TransitionContext';

export function useTransitionRouter() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useUser();
  const { pageTransitionRef, isStateTransitioning } = useTransitions();
  const pendingTransitionIn = useRef(false);
  const [currentPathName, setCurrentPathName] = useState(pathname);

  const push = (href: string, transition?: boolean) =>
    navigate(href, 'push', transition);

  const replace = (href: string, transition?: boolean) =>
    navigate(href, 'replace', transition);

  const navigate = async (
    href: string,
    method: 'push' | 'replace',
    transition: boolean = true
  ) => {
    if (href === pathname) {
      return;
    }

    if (user) {
      const isLogin = href.startsWith('/login') || pathname.startsWith('/login') || 
                      href.startsWith('/register') || pathname.startsWith('/register') ||
                      href.startsWith('/password-reset') || pathname.startsWith('/password-reset');
      if (isLogin) {
        console.warn('Login: User is logged in, redirecting to home');
        router.replace('/');
        return;
      }
    }

    const isLogout = href.startsWith('/logout') || pathname.startsWith('/logout');
    if (isStateTransitioning || !transition || !pageTransitionRef.current || isLogout) {
      router[method](href);
      return;
    }

    console.log('PAGE/ROUTER--------->out');
    await pageTransitionRef.current.transitionOut();
    console.log('PAGE/ROUTER<--------swap------->');
    pendingTransitionIn.current = true;
    router[method](href);
  };

  useEffect(() => {

    console.log(`Route changed to: ${pathname}`, isStateTransitioning, pageTransitionRef);

    if (isStateTransitioning || !pendingTransitionIn.current) {
      return;
    }
    
    (async () => {
      console.log('PAGE/ROUTER<--------wait------->');
      await new Promise(resolve => setTimeout(resolve, 1000));
      await pageTransitionRef.current!.transitionIn();
      console.log('PAGE/ROUTER<---------in');
      setCurrentPathName(pathname);
      pendingTransitionIn.current = false;
    })();
  }, [currentPathName, pathname, isStateTransitioning, pageTransitionRef, pendingTransitionIn]);

  return {
    ...router,
    push,
    replace,
  };
}
