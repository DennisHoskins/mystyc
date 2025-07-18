'use client';

import { use } from 'react';
import ScheduleExecutionPage from '@/components/admin/pages/schedule-executions/schedule-execution/ScheduleExecutionPage';

interface ScheduleExecutionPageProps {
  params: Promise<{
    executionId: string;
  }>;
}

export default function Page({ params }: ScheduleExecutionPageProps) {
  const { executionId } = use(params);

  return <ScheduleExecutionPage executionId={executionId} />
}