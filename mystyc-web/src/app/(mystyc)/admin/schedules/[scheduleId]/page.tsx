'use client';

import { use } from 'react';
import SchedulePage from '@/components/app/mystyc/admin/content/schedules/schedule/SchedulePage';

interface SchedulePageProps {
  params: Promise<{
    scheduleId: string;
  }>;
}

export default function Page({ params }: SchedulePageProps) {
  const { scheduleId } = use(params);

  return <SchedulePage scheduleId={scheduleId} />
}