'use client';

import { use } from 'react';
import DailyContentPage from '@/components/app/mystyc/admin/content/daily-contents/daily-content/DailyContentPage';

interface DailyContentPageProps {
  params: Promise<{
    contentId: string;
  }>;
}

export default function Page({ params }: DailyContentPageProps) {
  const { contentId } = use(params);

  return <DailyContentPage contentId={contentId} />
}