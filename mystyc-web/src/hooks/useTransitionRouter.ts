'use client'

import { useRouter } from 'next/navigation';

export function useTransitionRouter() {
  const router = useRouter();

  return {
    push: (h: string, t?: boolean) => { router.push(h); console.log(t); },
    replace: (h: string, t?: boolean) => { router.replace(h); console.log(t); },
  };
}

 