import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.schedule" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return {
    title,
  };
}

import { use } from 'react';

import SchedulePage from '@/components/admin/pages/schedules/schedule/SchedulePage';
import AdminTransition from '@/components/ui/layout/transition/AdminTransition';

interface SchedulePageProps {
  params: Promise<{ scheduleId: string; }>;
}

export default function Page({ params }: SchedulePageProps) {
  const { scheduleId } = use(params);

  return (
    <AdminTransition>
      <SchedulePage scheduleId={scheduleId} />
    </AdminTransition>      
  )
}