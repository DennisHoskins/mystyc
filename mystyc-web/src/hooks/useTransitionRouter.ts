'use client'

import { useRouter, usePathname } from 'next/navigation';

export function useTransitionRouter() {
  const pathname = usePathname();
  const router = useRouter();

  const navigateWithTransition = async (method: 'push' | 'replace' | 'back', url?: string | null) => {
    if (pathname === url) return;
    if (!url) {
      router[method]("");
      return;
    }
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
      if (doTransition) navigateWithTransition('back');
      else router.back();
    },
  };
}