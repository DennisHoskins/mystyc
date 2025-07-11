'use client';

import { use } from 'react';
import SessionPage from '@/components/mystyc/admin/pages/sessions/session/SessionPage';

interface DevicePageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default function Page({ params }: DevicePageProps) {
  const { sessionId } = use(params);

  return <SessionPage sessionId={sessionId} />
}