import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.auth-events" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import AuthenticationsPage from '@/components/admin/pages/authentications/AuthenticationsPage';

export default function Page() {
  return <AuthenticationsPage />;
}