import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.auth-event" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return {
    title,
  };
}

import { use } from 'react';

import AuthenticationPage from '@/components/admin/pages/authentications/authentication/AuthenticationPage';
import AdminTransition from '@/components/ui/layout/transition/AdminTransition';

interface AuthenticationPageProps {
  params: Promise<{ authId: string; }>;
}

export default function Page({ params }: AuthenticationPageProps) {
  const { authId } = use(params);

  return (
    <AdminTransition>
      <AuthenticationPage authId={authId} />
    </AdminTransition>      
  )
}