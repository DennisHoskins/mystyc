import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = `Emotional Expression | mystyc` + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import EmotionalExpressionPage from '@/components/mystyc/pages/profile/interactions/emotional-expression/EmotionalExpressionPage';

export default async function Page() {
  return <EmotionalExpressionPage />;
}