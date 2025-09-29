import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.astrology.energy-type" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import EnergyTypePage from '@/components/admin/pages/astrology/pages/energy-types/energy-type/EnergyTypePage';

export default async function Page({ params }: { params: Promise<{ energyType: string; }> }) {
  const { energyType } = await params;
  return <EnergyTypePage energyType={energyType} />;
}