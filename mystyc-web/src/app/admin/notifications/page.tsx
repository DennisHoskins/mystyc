import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.notifications" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import NotificationsPage from '@/components/admin/pages/notifications/NotificationsPage';

export default function Page() {
  return <NotificationsPage />;
}