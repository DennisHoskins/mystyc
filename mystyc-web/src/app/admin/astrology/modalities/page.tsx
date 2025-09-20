import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.astrology.modalities" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import ModalitiesPage from '@/components/admin/pages/astrology/pages/modalities/ModalitiesPage';

export default function Page() {
  return <ModalitiesPage />;
}