'use client'

import { usePathname } from 'next/navigation';

import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const pathname = usePathname();
  if (pathname !== '/login') {
    return null;
  }

  return <LoginForm />;
}