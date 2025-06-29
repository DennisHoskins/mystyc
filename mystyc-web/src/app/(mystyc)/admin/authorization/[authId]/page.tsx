'use client';

import { use } from 'react';
import AuthorizationPage from '@/components/app/mystyc/admin/content/authorizations/authorization/AuthorizationPage';

interface AuthorizationPageProps {
  params: Promise<{
    authId: string;
  }>;
}

export default function Page({ params }: AuthorizationPageProps) {
  const { authId } = use(params);

  return <AuthorizationPage authId={authId} />
}