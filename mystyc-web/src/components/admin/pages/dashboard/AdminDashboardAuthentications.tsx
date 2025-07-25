import { AdminStatsResponseExtended } from '@/interfaces/admin/stats';
import { AdminStatsResponseWithQuery } from 'mystyc-common/admin/interfaces/responses';

import AdminDashboardItemLayout from './AdminDashboardItemLayout';
import AuthenticationIcon from '@/components/admin/ui/icons/AuthenticationIcon';
import AuthenticationDashboard from '../authentications/AuthenticationDashboard';
import Link from '@/components/ui/Link';

export default function AdminDashboardAuthentications({ stats } : { stats?: AdminStatsResponseWithQuery<AdminStatsResponseExtended> | null }) {
  return (
      <AdminDashboardItemLayout
        icon={<AuthenticationIcon />}
        title="Authentication"
        link="/admin/authentication"
      >
        <Link
          className='flex-1 flex flex-col'
          href='/admin/authentication'
        >
          <AuthenticationDashboard 
            stats={stats?.data.authEvents ? {
              data: stats.data.authEvents,
              query: stats.query,
              queryString: stats.queryString,
            } : null}
            charts={['stats', 'peak', 'duration']}
            height={100}
          />
        </Link>
      </AdminDashboardItemLayout>
    );
  }