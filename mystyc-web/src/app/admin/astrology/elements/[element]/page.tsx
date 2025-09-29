import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.astrology.element" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import ElementPage from '@/components/admin/pages/astrology/pages/elements/element/ElementPage';
import { ElementType } from 'mystyc-common';

export default async function Page({ params }: { params: Promise<{ element: ElementType; }> }) {
  const { element } = await params;
  return <ElementPage element={element} />;
}