'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useTransitions } from '@/components/context/TransitionContext';
import { useUser } from '@/components/context/AppContext';
import { useAppStore } from '@/store/appStore';

export function useTransitionRouter() {
  const router = useRouter();
  const path = usePathname();
  const user = useUser();
  const { pageTransitionRef } = useTransitions();

  const isStateT = useAppStore((s) => s.isStateTransitioning);
  const isPageT = useAppStore((s) => s.isPageTransitioning);
  const setPageT = useAppStore((s) => s.setPageTransitioning);

  const [nextHref, setNextHref] = useState("");

  const swappingRef = useRef(false);
  const lastPathRef = useRef<string | null>(null);

  const navigate = async (
    href: string,
    method: 'push' | 'replace',
    transition = true
  ) => {
    if (href === path) {

console.log('ROUTER: Skipping transition for same path');

      return;
    } 

    if (href === '/logout' || path === '/logout') {

console.log('ROUTER: Skipping transition for logout');

      router[method](href);
      return;
    }

    if (user) {
      if (href == "/login" || path == "/login" || 
          href == "register" || path == "/register" || 
          href == "/password-reset" || path == "/password-reset") {

console.log('ROUTER: Redirecting to home from auth page');

        router.replace("/");
        return;
      }
    }

    if (!transition) {

console.log('ROUTER: No transition', method, href);

      router[method](href);
      return;
    }

    if (isStateT) {

console.log('ROUTER: Waiting for state to finish...');

      await new Promise<void>((res) => {
        const unsub = useAppStore.subscribe((st) => {
          if (!st.isStateTransitioning) {

console.log('ROUTER: State transition done');

            unsub();
            res();
          }
        });
      });
    }

console.log('');
console.log('ROUTER: out');

    await pageTransitionRef.current?.transitionOut();

    setPageT(true);
    swappingRef.current = true;

    setNextHref(href);

    router[method](href);
  };

  useEffect(() => {
    if (path === '/logout') {

console.log('ROUTER: /logout bailout');

      return;
    }
    if (!isPageT || !swappingRef.current) {

console.log('ROUTER: isPageT/swappingRef bailout');

      return;
    }
    if (lastPathRef.current === path) {

console.log('ROUTER: lastPathRef === path bailout');

      return;
    }

    swappingRef.current = false;
    lastPathRef.current = path;

    (async () => {

console.log('ROUTER: swap', nextHref);

// console.log('ROUTER: wait 250ms');
// await new Promise((r) => setTimeout(r, 250));

      await pageTransitionRef.current?.transitionIn();

console.log('ROUTER: in');
console.log('');

      setPageT(false);
    })();
  }, [path, isPageT, nextHref]);

  return {
    push: (h: string, t?: boolean) => navigate(h, 'push', t),
    replace: (h: string, t?: boolean) => navigate(h, 'replace', t),
  };
}
