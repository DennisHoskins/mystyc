import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.astrology.dynamics" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import DynamicsPage from '@/components/admin/pages/astrology/pages/dynamics/DynamicsPage';

export default function Page() {
  return <DynamicsPage />;
}