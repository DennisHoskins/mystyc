import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.deice.authentication" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import DeviceAuthEventsPage from '@/components/admin/pages/deices/deice/pages/DeviceAuthEventsPage';

export default async function Page({ params }: { params: Promise<{ deviceId: string; }> }) {
  const { deviceId } = await params;
  return <DeviceAuthEventsPage deviceId={deviceId} />;
}