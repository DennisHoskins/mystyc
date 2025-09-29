import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.astrology.planet" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import PlanetPage from '@/components/admin/pages/astrology/pages/planets/planet/PlanetPage';
import { PlanetType } from 'mystyc-common';

export default async function Page({ params }: { params: Promise<{ planet: PlanetType; }> }) {
  const { planet } = await params;
  return <PlanetPage planet={planet} />;
}