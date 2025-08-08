import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.astrology.modality" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import { use } from 'react';

import ModalityPage from '@/components/admin/pages/astrology/pages/modalities/modality/ModalityPage';
import { ModalityType } from 'mystyc-common';

export default function Page({ params }: { params: Promise<{ modality: ModalityType; }> }) {
  const { modality } = use(params);
  return <ModalityPage modality={modality} />;
}