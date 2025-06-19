'use client';

import { useRouter } from 'next/navigation';
import { useTransitions } from '@/components/context/TransitionContext';

export function useTransitionRouter() {
  const router = useRouter();
  const { pageTransitionRef, isStateTransitioning } = useTransitions();

  const push = async (href: string, transition: boolean = true) => {
    if (isStateTransitioning) {
      router.push(href);
      return;
    }
    
    if (transition && pageTransitionRef.current) {
      await pageTransitionRef.current.transitionOut();
      router.push(href);
    } else {
      router.push(href);
    }
  };

  const replace = async (href: string, transition: boolean = true) => {
    if (isStateTransitioning) {
      router.replace(href);
      return;
    }
    
    if (transition && pageTransitionRef.current) {
      await pageTransitionRef.current.transitionOut();
      router.replace(href);
    } else {
      router.replace(href);
    }
  };

  return {
    ...router,
    push,
    replace,
  };
}