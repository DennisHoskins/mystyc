import type { Metadata } from 'next';
import { ZodiacSignType } from 'mystyc-common';
import { formatStringForDisplay } from '@/util/util';

export async function generateMetadata({ params }: { params: Promise<{ sign: ZodiacSignType; }> }): Promise<Metadata> {
  const { sign } = await params;
  const title = `${formatStringForDisplay(sign)} | mystyc` + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import SignPage from '@/components/mystyc/pages/astrology/signs/sign/SignPage';

export default async function Page({ params }: { params: Promise<{ sign: ZodiacSignType; }> }) {
  const { sign } = await params;
  return <SignPage sign={sign} />;
}