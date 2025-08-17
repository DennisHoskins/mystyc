import { AdminStatsQuery, UserStats } from 'mystyc-common/admin';
import Link from '@/components/ui/Link';
import UsersIcon from '@/components/admin/ui/icons/UsersIcon';
import AdminDashboardItemLayout from './AdminDashboardItemLayout';
import UsersDashboard from '../users/UsersDashboard';

export default function AdminDashboardUsers({ query, stats, className } : { 
  query?: Partial<AdminStatsQuery> | null, 
  stats?: UserStats | null,
  className?: string
}) {
  return (
    <AdminDashboardItemLayout
      className={className}
      icon={<UsersIcon />}
      title="Users"
      link="/admin/users"
      stats={
        <Link href='/admin/users'>
          <UsersDashboard 
            query={query}
            stats={stats}
            charts={['stats']} 
          />
        </Link>
      }
    >
      <Link
        className='flex-1 flex flex-col'
        href='/admin/users'
      >
        <UsersDashboard 
          query={query}
          stats={stats}
          charts={['registrations']} 
        />
      </Link>
    </AdminDashboardItemLayout>
  );
}