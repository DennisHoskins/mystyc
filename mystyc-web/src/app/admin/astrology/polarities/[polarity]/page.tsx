import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.astrology.polarity" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import PolarityPage from '@/components/admin/pages/astrology/pages/polarities/polarity/PolarityPage';
import { PolarityType } from 'mystyc-common';

export default async function Page({ params }: { params: Promise<{ polarity: PolarityType; }> }) {
  const { polarity } = await params;
  return <PolarityPage polarity={polarity} />;
}