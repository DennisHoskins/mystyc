import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.astrology.element-interaction" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import ElementInteractionPage from '@/components/admin/pages/astrology/pages/element-interactions/interaction/ElementInteractionPage';

export default async function Page({ params }: { params: Promise<{ interaction: string; }> }) {
  const { interaction } = await params;
  return <ElementInteractionPage interaction={interaction} />;
}