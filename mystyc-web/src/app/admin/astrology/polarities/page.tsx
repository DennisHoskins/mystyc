import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.astrology.polarities" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import PolaritiesPage from '@/components/admin/pages/astrology/pages/polarities/PolaritiesPage';

export default function Page() {
  return <PolaritiesPage />;
}