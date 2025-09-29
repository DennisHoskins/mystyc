import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.traffic" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import TrafficPage from '@/components/admin/pages/traffic/TrafficPage';

export default function Page() {
  return <TrafficPage />;
}