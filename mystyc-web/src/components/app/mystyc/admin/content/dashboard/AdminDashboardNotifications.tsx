'use client';

import { AdminStatsResponseExtended } from '@/interfaces';
import { StatsResponseWithQuery } from '@/api/apiClientAdmin';

import AdminDashboardItemLayout from './AdminDashboardItemLayout';
import NotificationIcon from '@/components/app/mystyc/admin/ui/icons/NotificationIcon';
import NotificationsDashboard from '../notifications/NotificationsDashboard';
import Link from '@/components/ui/Link';

export default function AdminDashboardNotifications({ stats } : { stats?: StatsResponseWithQuery<AdminStatsResponseExtended> | null }) {
  if (!stats) {
    return;
  }

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
          stats={{
            data: stats.data.notifications,
            query: stats.query,
            queryString: stats.queryString,
          }}
          charts={['stats', 'volume', 'platforms']}
          height={100}
        />
      </Link>
    </AdminDashboardItemLayout>
  )
}