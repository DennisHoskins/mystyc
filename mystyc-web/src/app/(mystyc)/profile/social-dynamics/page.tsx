import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = `Social Dynamics | mystyc` + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import SocialDynamicsPage from '@/components/mystyc/pages/profile/interactions/social-dynamics/SocialDynamicsPage';

export default async function Page() {
  return <SocialDynamicsPage />;
}