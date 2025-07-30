import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.notification" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import { use } from 'react';

import NotificationPage from '@/components/admin/pages/notifications/notification/NotificationPage';

export default function Page({ params }: { params: Promise<{ notificationId: string; }> }) {
  const { notificationId } = use(params);
  return <NotificationPage notificationId={notificationId} />;
}