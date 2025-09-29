'use client'

import { useRouter, usePathname } from 'next/navigation';
import { useRef } from 'react';

export function useTransitionRouter() {
  const pathname = usePathname();
  const router = useRouter();
  const hasInternalNavigation = useRef(false);

  const navigateWithTransition = async (method: 'push' | 'replace', url: string) => {
    if (pathname === url) return;
    hasInternalNavigation.current = true;
    window.dispatchEvent(new CustomEvent('start-exit'));
    await new Promise<void>(resolve => {
      const handleExitComplete = () => {
        window.removeEventListener('exit-complete', handleExitComplete);
        resolve();
      };
      window.addEventListener('exit-complete', handleExitComplete);
    });
    router[method](url);
  };

  const backWithTransition = async () => {
    window.dispatchEvent(new CustomEvent('start-exit'));
    if (hasInternalNavigation.current) router.back();
    else router.push("/");
  };

  return {
    push: (url: string, doTransition: boolean = true) => {
      if (doTransition) navigateWithTransition('push', url);
      else router.push(url);
    },
    replace: (url: string, doTransition: boolean = true) => {
      if (doTransition) navigateWithTransition('replace', url);
      else router.replace(url);
    },
    back: (doTransition: boolean = true) => {
      if (doTransition) backWithTransition();
      else router.back();
    },
  };
}