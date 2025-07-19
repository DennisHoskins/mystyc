'use client';

import { useEffect } from 'react';

import { useAppStore } from '@/store/appStore';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';

export default function SubscribeErrorPage() {
  const router = useTransitionRouter();
  const { setSubscribeError } = useAppStore();
  
  useEffect(() => {
    setSubscribeError(true);
    router.replace("/subscribe");
  }, [setSubscribeError, router])

  return null;
}