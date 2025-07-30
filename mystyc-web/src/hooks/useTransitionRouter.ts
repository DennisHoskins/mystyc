'use client'

import { useRouter, usePathname } from 'next/navigation';

export function useTransitionRouter() {
  const pathname = usePathname();
  const router = useRouter();

  const navigateWithTransition = async (url: string, method: 'push' | 'replace') => {
    if (pathname === url) return;
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
      if (doTransition) navigateWithTransition(url, 'push');
      else router.push(url);
    },
    replace: (url: string, doTransition: boolean = true) => {
      if (doTransition) navigateWithTransition(url, 'replace');
      else router.replace(url);
    },
  };
}