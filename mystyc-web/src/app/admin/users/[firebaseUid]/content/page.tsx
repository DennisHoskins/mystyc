import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.user.content" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import UserContentPage from '@/components/admin/pages/users/user/pages/UserContentPage';

export default async function Page({ params }: { params: Promise<{ firebaseUid: string; }> }) {
  const { firebaseUid } = await params;
  return <UserContentPage firebaseUid={firebaseUid} />;
}