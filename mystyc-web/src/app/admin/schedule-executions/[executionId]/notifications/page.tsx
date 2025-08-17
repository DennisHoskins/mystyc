import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.execution.notifications" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import ScheduleExecutionNotificationsPage from '@/components/admin/pages/schedule-executions/schedule-execution/pages/ScheduleExecutionsNotificationsPage';

export default async function Page({ params }: { params: Promise<{ executionId: string; }> }) {
  const { executionId } = await params;
  return <ScheduleExecutionNotificationsPage executionId={executionId} />;
}