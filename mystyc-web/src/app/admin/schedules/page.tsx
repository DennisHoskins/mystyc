import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.schedules" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import SchedulesPage from '@/components/admin/pages/schedules/SchedulesPage';

export default function Page() {
  return <SchedulesPage />;
}