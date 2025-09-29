import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.device" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import DevicePage from '@/components/admin/pages/devices/device/DevicePage';

export default async function Page({ params }: { params: Promise<{ deviceId: string; }> }) {
  const { deviceId } = await params;
  return <DevicePage deviceId={deviceId} />;
}