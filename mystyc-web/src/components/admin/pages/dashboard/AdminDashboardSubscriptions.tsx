import { AdminStatsResponseExtended } from '@/interfaces/admin/stats';
import { AdminStatsResponseWithQuery } from 'mystyc-common/admin/interfaces/responses';

import Link from '@/components/ui/Link';
import SubscriberIcon from '@/components/admin/ui/icons/SubscriberIcon'
import AdminDashboardItemLayout from './AdminDashboardItemLayout';
import SubscriptionsDashboard  from '../subscriptions/SubscriptionsDashboard';

export default function AdminDashboardSubscriptions({ stats } : { stats?: AdminStatsResponseWithQuery<AdminStatsResponseExtended> | null }) {
  return (
    <AdminDashboardItemLayout
      className='col-span-1 flex flex-col'
      icon={<SubscriberIcon />}
      title="Subscriptions"
      link="/admin/subscriptions"
    >
      <Link
        className='flex-1 flex flex-col'
        href='/admin/subscriptions'
      >
        <div className='flex-1 flex flex-col space-y-4 xl:flex-row xl:space-x-4 xl:space-y-0'>
          <SubscriptionsDashboard
            className='w-full xl:w-64'
            stats={stats?.data.subscriptions ? {
              data: stats.data.subscriptions,
              query: stats.query,
              queryString: stats.queryString,
            } : null}
            charts={['stats']}
            height={100}
          />
          <SubscriptionsDashboard
            className='w-full'
            stats={stats?.data.subscriptions ? {
              data: stats.data.subscriptions,
              query: stats.query,
              queryString: stats.queryString,
            } : null}
            charts={['mrr']}
            height={100}
          />
        </div>
      </Link>
    </AdminDashboardItemLayout>
  );
}