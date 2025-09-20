import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.user.authentication" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import UserAuthEventsPage from '@/components/admin/pages/users/user/pages/UserAuthEventsPage';

export default async function Page({ params }: { params: Promise<{ firebaseUid: string; }> }) {
  const { firebaseUid } = await params;
  return <UserAuthEventsPage firebaseUid={firebaseUid} />;
}