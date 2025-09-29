import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = `Astrology | mystyc` + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import AstrologyPage from '@/components/mystyc/pages/astrology/AstrologyPage';

export default async function Page() {
  return <AstrologyPage />;
}