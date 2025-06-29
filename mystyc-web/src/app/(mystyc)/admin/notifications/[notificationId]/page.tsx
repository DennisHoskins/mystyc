'use client';

import { use } from 'react';
import NotificationPage from '@/components/app/mystyc/admin/content/notifications/notification/NotificationPage';

interface NotificationPageProps {
  params: Promise<{
    notificationId: string;
  }>;
}

export default function Page({ params }: NotificationPageProps) {
  const { notificationId } = use(params);

  return <NotificationPage notificationId={notificationId} />
}