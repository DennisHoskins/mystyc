import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.notification" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return {
    title,
  };
}

import { use } from 'react';

import NotificationPage from '@/components/admin/pages/notifications/notification/NotificationPage';

interface NotificationPageProps {
  params: Promise<{
    notificationId: string;
  }>;
}

export default function Page({ params }: NotificationPageProps) {
  const { notificationId } = use(params);

  return <NotificationPage notificationId={notificationId} />
}