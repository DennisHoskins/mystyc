'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from '@/components/Transition';

export function useTransitionRouter() {
  const router = useRouter();
  const { startTransition } = useTransition();

  const push = (href: string) => {
    startTransition(() => {
      router.push(href);
    });
  };

  const replace = (href: string) => {
    startTransition(() => {
      router.replace(href);
    });
  };

  return {
    ...router,
    push,
    replace,
  };
}