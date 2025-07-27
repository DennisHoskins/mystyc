import { AdminStatsQuery, NotificationStats } from 'mystyc-common/admin';
import Link from '@/components/ui/Link';
import NotificationIcon from '@/components/admin/ui/icons/NotificationIcon';
import NotificationsDashboard from '../notifications/NotificationsDashboard';
import AdminDashboardItemLayout from './AdminDashboardItemLayout';

export default function AdminDashboardNotifications({ query, stats } : { 
  query?: Partial<AdminStatsQuery> | null, 
  stats?: NotificationStats | null 
}) {
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
          query={query}
          stats={stats}
          charts={['stats', 'volume', 'platforms']}
          height={100}
        />
      </Link>
    </AdminDashboardItemLayout>
  )
}