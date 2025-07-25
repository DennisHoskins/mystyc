import { AdminStatsResponseExtended } from '@/interfaces/admin/stats';
import { AdminStatsResponseWithQuery } from 'mystyc-common/admin/interfaces/responses';

import Link from '@/components/ui/Link';
import OpenAIIcon from '@/components/admin/ui/icons/OpenAIIcon'
import AdminDashboardItemLayout from './AdminDashboardItemLayout';
import OpenAIUsageDashboard from '../openai/OpenAIUsageDashboard';

export default function AdminDashboardOpenAI({ stats } : { stats?: AdminStatsResponseWithQuery<AdminStatsResponseExtended> | null }) {
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
            stats={stats?.data.openai ? {
              data: stats.data.openai,
              query: stats.query,
              queryString: stats.queryString,
            } : null}
            charts={['stats']}
            height={100}
          />
          <OpenAIUsageDashboard
            className='w-full'
            stats={stats?.data.openai ? {
              data: stats.data.openai,
              query: stats.query,
              queryString: stats.queryString,
            } : null}
            charts={['budget']}
            height={100}
          />
        </div>
      </Link>
    </AdminDashboardItemLayout>
  );
}