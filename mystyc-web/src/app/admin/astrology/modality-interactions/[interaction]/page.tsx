import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.astrology.modality-interaction" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import ModalityInteractionPage from '@/components/admin/pages/astrology/pages/modality-interactions/interaction/ModalityInteractionPage';

export default async function Page({ params }: { params: Promise<{ interaction: string; }> }) {
  const { interaction } = await params;
  return <ModalityInteractionPage interaction={interaction} />;
}