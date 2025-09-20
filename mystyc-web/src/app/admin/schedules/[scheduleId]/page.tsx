import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.schedule" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import SchedulePage from '@/components/admin/pages/schedules/schedule/SchedulePage';

export default async function Page({ params }: { params: Promise<{ scheduleId: string; }> }) {
  const { scheduleId } = await params;
  return <SchedulePage scheduleId={scheduleId} />;
}