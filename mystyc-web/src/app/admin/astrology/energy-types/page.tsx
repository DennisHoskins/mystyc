import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.astrology.energy-types" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import EnergyTypesPage from '@/components/admin/pages/astrology/pages/energy-types/EnergyTypesPage';

export default function Page() {
  return <EnergyTypesPage />;
}