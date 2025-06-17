'use client';

import { useRouter } from 'next/navigation';

export function useTransitionRouter() {
  const router = useRouter();

  const push = (href: string) => {
    router.push(href);
  };

  const replace = (href: string) => {
    router.replace(href);
  };

  return {
    ...router,
    push,
    replace,
  };
}