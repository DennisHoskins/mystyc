'use client';

import { AdminStatsResponseExtended } from '@/interfaces';
import { StatsResponseWithQuery } from '@/api/apiClientAdmin';

import AdminDashboardItemLayout from './AdminDashboardItemLayout';
import OpenAIUsageDashboard from '../openai/OpenAIUsageDashboard';
import OpenAIIcon from '@/components/mystyc/admin/ui/icons/OpenAIIcon'
import Link from '@/components/ui/Link';

export default function AdminDashboardOpenAI({ stats } : { stats?: StatsResponseWithQuery<AdminStatsResponseExtended> | null }) {
  if (!stats) {
    return;
  }

  return (
    <AdminDashboardItemLayout
      className='col-span-1 flex flex-col'
      icon={<OpenAIIcon />}
      title="Open AI"
      link="/admin/openai"
    >
      <Link
        className='flex-1 flex flex-col'
        href='/admin/openai'
      >
        <div className='flex-1 flex flex-col space-y-4 xl:flex-row xl:space-x-4 xl:space-y-0'>
          <OpenAIUsageDashboard
            className='w-full xl:w-64'
            stats={{
              data: stats.data.openai,
              query: stats.query,
              queryString: stats.queryString,
            }}
            charts={['stats']}
            height={100}
          />
          <OpenAIUsageDashboard
            className='w-full'
            stats={{
              data: stats.data.openai,
              query: stats.query,
              queryString: stats.queryString,
            }}
            charts={['budget']}
            height={100}
          />
        </div>
      </Link>
    </AdminDashboardItemLayout>
  );
}