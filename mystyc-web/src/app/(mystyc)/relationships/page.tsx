import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = `Relationships | mystyc` + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import RelationshipsPage from '@/components/mystyc/pages/relationships/RelationshipsPage';

export default async function Page() {
  return <RelationshipsPage />;
}