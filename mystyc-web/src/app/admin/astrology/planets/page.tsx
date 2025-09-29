import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.astrology.planets" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import PlanetsPage from '@/components/admin/pages/astrology/pages/planets/PlanetsPage';

export default function Page() {
  return <PlanetsPage />;
}