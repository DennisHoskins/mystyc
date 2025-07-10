'use client';

import { AdminStatsResponseExtended } from '@/interfaces';
import { StatsResponseWithQuery } from '@/api/apiClientAdmin';

import AdminDashboardItemLayout from './AdminDashboardItemLayout';
import AiIcon from '@/components/app/mystyc/admin/ui/icons/AiIcon'

export default function AdminDashboardOpenAi({ stats } : { stats?: StatsResponseWithQuery<AdminStatsResponseExtended> | null }) {
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