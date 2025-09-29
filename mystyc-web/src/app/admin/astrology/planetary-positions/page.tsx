import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.astrology.planetary-positions" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import PlanetaryPositionsPage from '@/components/admin/pages/astrology/pages/planetary-positions/PlanetaryPositionsPage';

export default function Page() {
  return <PlanetaryPositionsPage />;
}