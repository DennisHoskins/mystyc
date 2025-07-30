import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.contents" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import ContentsPage from '@/components/admin/pages/contents/ContentsPage';

export default function Page() {
  return <ContentsPage />;
}