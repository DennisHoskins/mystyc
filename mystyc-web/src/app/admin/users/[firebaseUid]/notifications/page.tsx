import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.user.notifications" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import UserNotificationsPage from '@/components/admin/pages/users/user/pages/UserNotificationsPage';

export default async function Page({ params }: { params: Promise<{ firebaseUid: string; }> }) {
  const { firebaseUid } = await params;
  return <UserNotificationsPage firebaseUid={firebaseUid} />;
}