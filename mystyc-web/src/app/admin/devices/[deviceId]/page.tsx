import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.device" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import { use } from 'react';

import DevicePage from '@/components/admin/pages/devices/device/DevicePage';

export default function Page({ params }: { params: Promise<{ deviceId: string; }> }) {
  const { deviceId } = use(params);
  return <DevicePage deviceId={deviceId} />;
}