import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.executions" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return {
    title,
  };
}

import SchedulesExecutionsPage from '@/components/admin/pages/schedule-executions/SchedulesExecutionsPage';
import AdminTransition from '@/components/ui/layout/transition/AdminTransition';

export default function Page() {
  return (
    <AdminTransition>
      <SchedulesExecutionsPage />
    </AdminTransition>      
  )
}