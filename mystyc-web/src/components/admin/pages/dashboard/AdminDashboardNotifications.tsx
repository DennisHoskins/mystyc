import { AdminStatsResponseExtended } from '@/interfaces/admin/stats';

import Link from '@/components/ui/Link';
import NotificationIcon from '@/components/admin/ui/icons/NotificationIcon';
import NotificationsDashboard from '../notifications/NotificationsDashboard';
import AdminDashboardItemLayout from './AdminDashboardItemLayout';

export default function AdminDashboardNotifications({ stats } : { stats?: AdminStatsResponseExtended | null }) {
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
          stats={stats?.notifications}
          charts={['stats', 'volume', 'platforms']}
          height={100}
        />
      </Link>
    </AdminDashboardItemLayout>
  )
}