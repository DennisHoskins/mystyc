import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.execution" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return {
    title,
  };
}

import { use } from 'react';

import ScheduleExecutionPage from '@/components/admin/pages/schedule-executions/schedule-execution/ScheduleExecutionPage';
import AdminTransition from '@/components/ui/layout/transition/AdminTransition';

interface ScheduleExecutionPageProps {
  params: Promise<{ executionId: string; }>;
}

export default function Page({ params }: ScheduleExecutionPageProps) {
  const { executionId } = use(params);

  return (
    <AdminTransition>
      <ScheduleExecutionPage executionId={executionId} />
    </AdminTransition>      
  )
}