import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.execution.content" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import ScheduleExecutionContentPage from '@/components/admin/pages/schedule-executions/schedule-execution/pages/ScheduleExecutionsContentPage copy';

export default async function Page({ params }: { params: Promise<{ executionId: string; }> }) {
  const { executionId } = await params;
  return <ScheduleExecutionContentPage executionId={executionId} />;
}