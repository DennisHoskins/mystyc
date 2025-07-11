'use client';

import { useTransitionRouter } from '@/hooks/useTransitionRouter';

import Button from '@/components/ui/Button';

export default function WebsiteHeader() {
  const router = useTransitionRouter();

  return (
    <div className="flex space-x-4 ml-auto">
      <Button
        variant="ghost"
        onClick={() => router.push('/login')}
        className="text-sm font-medium hover:underline"
      >
        Login
      </Button>
      <Button
        variant="primary"
        onClick={() => router.push('/register')}
        className="text-sm font-medium"
      >
        Sign Up
      </Button>
    </div>
  );
}
