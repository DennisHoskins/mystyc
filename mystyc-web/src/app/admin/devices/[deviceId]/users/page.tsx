import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.device.users" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import DeviceUsersPage from '@/components/admin/pages/devices/device/pages/DeviceUsersPage';

export default async function Page({ params }: { params: Promise<{ deviceId: string; }> }) {
  const { deviceId } = await params;
  return <DeviceUsersPage deviceId={deviceId} />;
}