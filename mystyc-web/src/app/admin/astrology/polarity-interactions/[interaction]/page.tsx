import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.astrology.polarity-interaction" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import PolarityInteractionPage from '@/components/admin/pages/astrology/pages/polarity-interactions/interaction/PolarityInteractionPage';

export default async function Page({ params }: { params: Promise<{ interaction: string; }> }) {
  const { interaction } = await params;
  return <PolarityInteractionPage interaction={interaction} />;
}