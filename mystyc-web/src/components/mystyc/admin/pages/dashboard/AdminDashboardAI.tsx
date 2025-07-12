'use client';

import { AdminStatsResponseExtended } from '@/interfaces';
import { StatsResponseWithQuery } from '@/api/apiClientAdmin';

import AdminDashboardItemLayout from './AdminDashboardItemLayout';
import AiIcon from '@/components/mystyc/admin/ui/icons/AiIcon'

export default function AdminDashboardOpenAI({ stats } : { stats?: StatsResponseWithQuery<AdminStatsResponseExtended> | null }) {
  if (!stats) {
    return;
  }

  return (
    <AdminDashboardItemLayout
      className='col-span-1 flex flex-col'
      icon={<AiIcon />}
      title="Open AI"
      link="/admin/openai"
    >
      Open AI
    </AdminDashboardItemLayout>
  );
}