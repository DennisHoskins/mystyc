import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.astrology.dynamic" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import DynamicPage from '@/components/admin/pages/astrology/pages/dynamics/dynamic/DynamicPage';
import { DynamicType } from 'mystyc-common';

export default async function Page({ params }: { params: Promise<{ dynamic: DynamicType; }> }) {
  const { dynamic } = await params;
  return <DynamicPage dynamic={dynamic} />;
}