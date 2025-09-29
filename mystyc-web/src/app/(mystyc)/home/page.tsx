import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = `Today | mystyc` + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import MystycHome from '@/components/mystyc/MystycHome';

export default async function Page() {
  return <MystycHome />;
}