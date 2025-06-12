'use client';

import { useRouter } from 'next/navigation';

export function useCustomRouter() {
  const router = useRouter();

  const navigate = (method: 'push' | 'replace', href: string) => {
    router[method](href);
  };

  const push = (href: string) => {
    navigate('push', href);
  };

  const replace = (href: string) => {
    navigate('replace', href);
  };

  return {
    ...router,
    push,
    replace,
  };
}