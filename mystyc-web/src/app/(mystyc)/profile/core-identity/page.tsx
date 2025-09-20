import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = `Core Identity | mystyc` + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import CoreIdentityPage from '@/components/mystyc/pages/profile/interactions/core-identity/CoreIdentityPage';

export default async function Page() {
  return <CoreIdentityPage />;
}