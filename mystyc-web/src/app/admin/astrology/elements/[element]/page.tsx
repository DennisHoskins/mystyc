import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.astrology.element" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import { use } from 'react';

import ElementPage from '@/components/admin/pages/astrology/pages/elements/element/ElementPage';
import { ElementType } from 'mystyc-common';

export default function Page({ params }: { params: Promise<{ element: ElementType; }> }) {
  const { element } = use(params);
  return <ElementPage element={element} />;
}