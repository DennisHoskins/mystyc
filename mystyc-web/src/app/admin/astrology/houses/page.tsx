import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.astrology.houses" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import HousesPage from '@/components/admin/pages/astrology/pages/houses/HousesPage';

export default function Page() {
  return <HousesPage />;
}