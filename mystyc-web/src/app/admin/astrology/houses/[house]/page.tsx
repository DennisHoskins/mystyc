import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.astrology.house" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import HousePage from '@/components/admin/pages/astrology/pages/houses/house/HousePage';

export default async function Page({ params }: { params: Promise<{ house: number; }> }) {
  const { house } = await params;
  return <HousePage house={house} />;
}