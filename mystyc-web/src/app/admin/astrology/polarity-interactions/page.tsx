import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.astrology.polarity-interactions" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import PolarityInteractionsPage from '@/components/admin/pages/astrology/pages/polarity-interactions/PolarityInteractionsPage';

export default function Page() {
  return <PolarityInteractionsPage />;
}