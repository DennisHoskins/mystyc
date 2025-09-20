import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.astrology.sign" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import SignPage from '@/components/admin/pages/astrology/pages/signs/sign/SignPage';
import { ZodiacSignType } from 'mystyc-common';

export default async function Page({ params }: { params: Promise<{ sign: ZodiacSignType; }> }) {
  const { sign } = await params;
  return <SignPage sign={sign} />;
}