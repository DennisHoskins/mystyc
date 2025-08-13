import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.auth-event" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import AuthenticationPage from '@/components/admin/pages/authentications/authentication/AuthenticationPage';

export default async function Page({ params }: { params: Promise<{ authId: string; }> }) {
  const { authId } = await params;
  return <AuthenticationPage authId={authId} />;
}