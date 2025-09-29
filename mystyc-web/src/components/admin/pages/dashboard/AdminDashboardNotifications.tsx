import { AdminStatsQuery, NotificationStats } from 'mystyc-common/admin';
import Link from '@/components/ui/Link';
import NotificationIcon from '@/components/admin/ui/icons/NotificationIcon';
import NotificationsDashboard from '../notifications/NotificationsDashboard';
import AdminDashboardItemLayout from './AdminDashboardItemLayout';

export default function AdminDashboardNotifications({ query, stats, className } : { 
  query?: Partial<AdminStatsQuery> | null, 
  stats?: NotificationStats | null,
  className?: string 
}) {
  return (
    <AdminDashboardItemLayout
      className={className}
      icon={<NotificationIcon />}
      title="Notifications"
      link="/admin/notifications"
      stats={
        <Link href='/admin/notifications'>
          <NotificationsDashboard 
            query={query}
            stats={stats}
            charts={['stats']}
          />
        </Link>
      }
    >
      <Link
        className='flex-1 flex'
        href='/admin/notifications'
      >
        <NotificationsDashboard 
          query={query}
          stats={stats}
          charts={['volume']}
        />
      </Link>
    </AdminDashboardItemLayout>
  )
}