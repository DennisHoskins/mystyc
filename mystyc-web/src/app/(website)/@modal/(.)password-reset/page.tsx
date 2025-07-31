'use client'

import { usePathname } from 'next/navigation';

import PasswordResetForm from '@/components/auth/PasswordResetForm';

export default function PasswordResetPage() {
  const pathname = usePathname();
  if (pathname !== '/password-reset') {
    return null;
  }

  return <PasswordResetForm />;
}