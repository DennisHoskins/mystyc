import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.session" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return {
    title,
  };
}

import { use } from 'react';

import SessionPage from '@/components/admin/pages/sessions/session/SessionPage';
import AdminTransition from '@/components/ui/layout/transition/AdminTransition';

interface DevicePageProps {
  params: Promise<{ sessionId: string; }>;
}

export default function Page({ params }: DevicePageProps) {
  const { sessionId } = use(params);

  return (
    <AdminTransition>
      <SessionPage sessionId={sessionId} />
    </AdminTransition>      
  )
}