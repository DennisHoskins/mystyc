import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.session" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import SessionPage from '@/components/admin/pages/sessions/session/SessionPage';

export default async function Page({ params }: { params: Promise<{ sessionId: string; }> }) {
  const { sessionId } = await params;
  return <SessionPage sessionId={sessionId} />;
}