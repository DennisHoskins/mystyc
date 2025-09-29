import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.astrology.element-interactions" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import ElementInteractionsPage from '@/components/admin/pages/astrology/pages/element-interactions/ElementInteractionsPage';

export default function Page() {
  return <ElementInteractionsPage />;
}