import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.astrology.planet-interactions" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import PlanetInteractionsPage from '@/components/admin/pages/astrology/pages/planet-interactions/PlanetInteractionsPage';

export default function Page() {
  return <PlanetInteractionsPage />;
}