import type { Metadata } from 'next';
import { ZodiacSignType } from 'mystyc-common';
import { formatStringForDisplay } from '@/util/util';

export async function generateMetadata({ params }: { params: Promise<{ sign: ZodiacSignType; }> }): Promise<Metadata> {
  const { sign } = await params;
  const title = `${formatStringForDisplay(sign)} - Relationships | mystyc` + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import RelationshipPage from '@/components/mystyc/pages/relationships/relationship/RelationshipPage';

export default async function Page({ params }: { params: Promise<{ sign: ZodiacSignType; }> }) {
  const { sign } = await params;
  return <RelationshipPage sign={sign} />;
}