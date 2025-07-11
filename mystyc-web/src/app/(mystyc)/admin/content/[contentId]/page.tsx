'use client';

import { use } from 'react';
import ContentPage from '@/components/mystyc/admin/pages/contents/content/ContentPage';

interface ContentPageProps {
  params: Promise<{
    contentId: string;
  }>;
}

export default function Page({ params }: ContentPageProps) {
  const { contentId } = use(params);

  return <ContentPage contentId={contentId} />
}