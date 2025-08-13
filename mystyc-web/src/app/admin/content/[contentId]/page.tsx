import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.content" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import ContentPage from '@/components/admin/pages/contents/content/ContentPage';

export default async function Page({ params }: { params: Promise<{ contentId: string; }> }) {
  const { contentId } = await params;
  return <ContentPage contentId={contentId} />;
}