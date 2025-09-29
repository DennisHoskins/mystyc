import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.user.devices" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import UserDevicesPage from '@/components/admin/pages/users/user/pages/UserDevicesPage';

export default async function Page({ params }: { params: Promise<{ firebaseUid: string; }> }) {
  const { firebaseUid } = await params;
  return <UserDevicesPage firebaseUid={firebaseUid} />;
}