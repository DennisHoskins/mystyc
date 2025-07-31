'use client'

import { usePathname } from 'next/navigation';

import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  const pathname = usePathname();
  if (pathname !== '/register') {
    return null;
  }

  return <RegisterForm />;
}