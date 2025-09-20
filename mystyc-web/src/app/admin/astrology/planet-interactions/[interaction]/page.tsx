import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.astrology.planet-interaction" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import PlanetInteractionPage from '@/components/admin/pages/astrology/pages/planet-interactions/interaction/PlanetInteractionPage';

export default async function Page({ params }: { params: Promise<{ interaction: string; }> }) {
  const { interaction } = await params;
  return <PlanetInteractionPage interaction={interaction} />;
}