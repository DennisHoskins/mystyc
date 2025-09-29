import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.device.notifications" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import DeviceNotificationsPage from '@/components/admin/pages/devices/device/pages/DeviceNotificationsPage';

export default async function Page({ params }: { params: Promise<{ deviceId: string; }> }) {
  const { deviceId } = await params;
  return <DeviceNotificationsPage deviceId={deviceId} />;
}