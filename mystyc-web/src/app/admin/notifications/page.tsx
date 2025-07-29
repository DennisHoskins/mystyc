import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.notifications" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return {
    title,
  };
}

import NotificationsPage from '@/components/admin/pages/notifications/NotificationsPage';
import AdminTransition from '@/components/ui/layout/transition/AdminTransition';

export default function Page() {
  return (
    <AdminTransition>
      <NotificationsPage />
    </AdminTransition>      
  )
}