import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.astrology.sign" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import { use } from 'react';

import SignPage from '@/components/admin/pages/astrology/pages/signs/sign/SignPage';
import { ZodiacSignType } from 'mystyc-common';

export default function Page({ params }: { params: Promise<{ sign: ZodiacSignType; }> }) {
  const { sign } = use(params);
  return <SignPage sign={sign} />;
}