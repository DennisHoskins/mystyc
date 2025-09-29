import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.user.astrology" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import UserAstrologyPage from '@/components/admin/pages/users/user/pages/astrology/UserAstrologyPage';

export default async function Page({ params }: { params: Promise<{ firebaseUid: string; }> }) {
  const { firebaseUid } = await params;
  return <UserAstrologyPage firebaseUid={firebaseUid} />;
}