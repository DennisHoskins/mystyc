import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.astrology.signs" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import SignsPage from '@/components/admin/pages/astrology/pages/signs/SignsPage';

export default function Page() {
  return <SignsPage />;
}