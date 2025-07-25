import { AdminStatsResponseExtended } from '@/interfaces/admin/stats';
import { AdminStatsResponseWithQuery } from 'mystyc-common/admin/interfaces/responses';

import Link from '@/components/ui/Link';
import UsersIcon from '@/components/admin/ui/icons/UsersIcon';
import AdminDashboardItemLayout from './AdminDashboardItemLayout';
import UsersDashboard from '../users/UsersDashboard';

export default function AdminDashboardUsers({ stats } : { stats?: AdminStatsResponseWithQuery<AdminStatsResponseExtended> | null }) {
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
          stats={stats?.data.users ? {
            data: stats.data.users,
            query: stats.query,
            queryString: stats.queryString,
          } : null}
          charts={['stats', 'registrations', 'activity']} 
          height={100}
        />
      </Link>
    </AdminDashboardItemLayout>
  );
}