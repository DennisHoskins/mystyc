import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = `Profile | mystyc` + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import ProfilePage from '@/components/mystyc/pages/profile/ProfilePage';

export default async function Page() {
  return <ProfilePage />;
}