import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.astrology" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import AstrologyPage from '@/components/admin/pages/astrology/AstrologyPage';

export default function Page() {
  return <AstrologyPage />;
}