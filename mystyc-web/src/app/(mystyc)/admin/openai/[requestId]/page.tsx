'use client';

import { use } from 'react';
import OpenAIRequestPage from '@/components/mystyc/admin/pages/openai/request/OpenAIRequestPage';

interface OpenAIRequestPageProps {
  params: Promise<{
    requestId: string;
  }>;
}

export default function Page({ params }: OpenAIRequestPageProps) {
  const { requestId } = use(params);

  return <OpenAIRequestPage requestId={requestId} />
}