import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.auth-event" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import { use } from 'react';

import AuthenticationPage from '@/components/admin/pages/authentications/authentication/AuthenticationPage';

export default function Page({ params }: { params: Promise<{ authId: string; }> }) {
  const { authId } = use(params);
  return <AuthenticationPage authId={authId} />;
}