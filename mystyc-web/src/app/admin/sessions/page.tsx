import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.sessions" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import SessionsPage from '@/components/admin/pages/sessions/SessionsPage';

export default function Page() {
  return <SessionsPage />;
}