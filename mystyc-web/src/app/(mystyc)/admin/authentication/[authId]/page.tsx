'use client';

import { use } from 'react';
import AuthenticationPage from '@/components/app/mystyc/admin/content/authentications/authentication/AuthenticationPage';

interface AuthenticationPageProps {
  params: Promise<{
    authId: string;
  }>;
}

export default function Page({ params }: AuthenticationPageProps) {
  const { authId } = use(params);

  return <AuthenticationPage authId={authId} />
}