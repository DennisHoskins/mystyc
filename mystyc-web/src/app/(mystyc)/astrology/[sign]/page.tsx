import type { Metadata } from 'next';
import { ZodiacSignType } from 'mystyc-common';

export async function generateMetadata({ params }: { params: Promise<{ sign: ZodiacSignType; }> }): Promise<Metadata> {
  const { sign } = await params;
  const title = `${sign} | mystyc` + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import SignPage from '@/components/mystyc/pages/astrology/SignPage';

export default async function Page({ params }: { params: Promise<{ sign: ZodiacSignType; }> }) {
  const { sign } = await params;
  return <SignPage sign={sign} />;
}