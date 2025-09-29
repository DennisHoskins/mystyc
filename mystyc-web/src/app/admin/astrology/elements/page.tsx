import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.astrology.elements" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import ElementsPage from '@/components/admin/pages/astrology/pages/elements/ElementsPage';

export default function Page() {
  return <ElementsPage />;
}