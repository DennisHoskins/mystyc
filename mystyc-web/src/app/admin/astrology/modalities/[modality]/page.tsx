import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.astrology.modality" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import ModalityPage from '@/components/admin/pages/astrology/pages/modalities/modality/ModalityPage';
import { ModalityType } from 'mystyc-common';

export default async function Page({ params }: { params: Promise<{ modality: ModalityType; }> }) {
  const { modality } = await params;
  return <ModalityPage modality={modality} />;
}