import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.astrology.dynamic" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import { use } from 'react';

import DynamicPage from '@/components/admin/pages/astrology/pages/dynamics/dynamic/DynamicPage';
import { DynamicType } from 'mystyc-common';

export default function Page({ params }: { params: Promise<{ dynamic: DynamicType; }> }) {
  const { dynamic } = use(params);
  return <DynamicPage dynamic={dynamic} />;
}