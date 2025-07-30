import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.openai" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import OpenAIPage from '@/components/admin/pages/openai/OpenAIPage';

export default function Page() {
  return <OpenAIPage />;
}