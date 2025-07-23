import { AdminStatsResponseExtended } from '@/interfaces/admin/stats';
import { StatsResponseWithQuery } from '@/api/apiClientAdmin';

import Link from '@/components/ui/Link';
import UsersIcon from '@/components/admin/ui/icons/UsersIcon';
import AdminDashboardItemLayout from './AdminDashboardItemLayout';
import UsersDashboard from '../users/UsersDashboard';

export default function AdminDashboardUsers({ stats } : { stats?: StatsResponseWithQuery<AdminStatsResponseExtended> | null }) {
  if (!stats) {
    return;
  }

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
          stats={{
            data: stats.data.users,
            query: stats.query,
            queryString: stats.queryString,
          }}
          charts={['stats', 'registrations', 'activity']} 
          height={100}
        />
      </Link>
    </AdminDashboardItemLayout>
  );
}