import { AdminStatsResponseExtended } from '@/interfaces/admin/stats';
import { AdminStatsResponseWithQuery } from 'mystyc-common/admin/interfaces/responses';

import Link from '@/components/ui/Link';
import NotificationIcon from '@/components/admin/ui/icons/NotificationIcon';
import NotificationsDashboard from '../notifications/NotificationsDashboard';
import AdminDashboardItemLayout from './AdminDashboardItemLayout';

export default function AdminDashboardNotifications({ stats } : { stats?: AdminStatsResponseWithQuery<AdminStatsResponseExtended> | null }) {
  return (
    <AdminDashboardItemLayout
      icon={<NotificationIcon />}
      title="Notifications"
      link="/admin/notifications"
    >
      <Link
        className='flex-1 flex flex-col'
        href='/admin/notifications'
      >
        <NotificationsDashboard 
          stats={stats?.data.notifications ? {
            data: stats.data.notifications,
            query: stats.query,
            queryString: stats.queryString,
          } : null}
          charts={['stats', 'volume', 'platforms']}
          height={100}
        />
      </Link>
    </AdminDashboardItemLayout>
  )
}