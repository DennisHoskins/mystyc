import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.session" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return {
    title,
  };
}

import { use } from 'react';

import SessionPage from '@/components/admin/pages/sessions/session/SessionPage';

interface DevicePageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default function Page({ params }: DevicePageProps) {
  const { sessionId } = use(params);

  return <SessionPage sessionId={sessionId} />
}