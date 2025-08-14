import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.device.authentication" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import DeviceAuthEventsPage from '@/components/admin/pages/devices/device/pages/DeviceAuthEventsPage';

export default async function Page({ params }: { params: Promise<{ deviceId: string; }> }) {
  const { deviceId } = await params;
  return <DeviceAuthEventsPage deviceId={deviceId} />;
}