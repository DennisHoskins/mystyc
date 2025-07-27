import { AdminStatsQuery, UserStats } from 'mystyc-common/admin';

import Link from '@/components/ui/Link';
import UsersIcon from '@/components/admin/ui/icons/UsersIcon';
import AdminDashboardItemLayout from './AdminDashboardItemLayout';
import UsersDashboard from '../users/UsersDashboard';

export default function AdminDashboardUsers({ query, stats } : { 
  query?: Partial<AdminStatsQuery> | null, 
  stats?: UserStats | null 
}) {
  return (
    <AdminDashboardItemLayout
      icon={<UsersIcon />}
      title="Users"
      link="/admin/users"
    >
      <Link
        className='flex-1 flex flex-col'
        href='/admin/users'
      >
        <UsersDashboard 
          query={query}
          stats={stats}
          charts={['stats', 'registrations', 'activity']} 
          height={100}
        />
      </Link>
    </AdminDashboardItemLayout>
  );
}