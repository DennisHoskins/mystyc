import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.astrology.modality-interactions" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import ModalityInteractionsPage from '@/components/admin/pages/astrology/pages/modality-interactions/ModalityInteractionsPage';

export default function Page() {
  return <ModalityInteractionsPage />;
}