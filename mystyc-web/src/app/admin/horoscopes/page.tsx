import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.horoscopes" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import HoroscopesPage from '@/components/admin/pages/horoscopes/HoroscopesPage';

export default function Page() {
  return <HoroscopesPage />;
}