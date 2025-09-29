import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.user" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import UserPage from '@/components/admin/pages/users/user/UserPage';

export default async function Page({ params }: { params: Promise<{ firebaseUid: string; }> }) {
  const { firebaseUid } = await params;
  return <UserPage firebaseUid={firebaseUid} />;
}