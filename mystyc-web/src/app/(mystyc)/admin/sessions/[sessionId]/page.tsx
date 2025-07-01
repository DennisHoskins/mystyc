'use client';

import { use } from 'react';
import SessionPage from '@/components/app/mystyc/admin/content/sessions/session/SessionPage';

interface DevicePageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default function Page({ params }: DevicePageProps) {
  const { sessionId } = use(params);

  return <SessionPage sessionId={sessionId} />
}