import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = "mystyc.content" + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return {
    title,
  };
}

import { use } from 'react';

import ContentPage from '@/components/admin/pages/contents/content/ContentPage';
import AdminTransition from '@/components/ui/layout/transition/AdminTransition';

interface ContentPageProps {
  params: Promise<{ contentId: string; }>;
}

export default function Page({ params }: ContentPageProps) {
  const { contentId } = use(params);

  return (
    <AdminTransition>
      <ContentPage contentId={contentId} />
    </AdminTransition>      
  )
}