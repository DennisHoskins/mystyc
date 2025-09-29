import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.astrology.planetary-position" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import PlanetaryPositionPage from '@/components/admin/pages/astrology/pages/planetary-positions/position/PlanetaryPositionPage';

export default async function Page({ params }: { params: Promise<{ position: string; }> }) {
  const { position } = await params;
  return <PlanetaryPositionPage position={position} />;
}