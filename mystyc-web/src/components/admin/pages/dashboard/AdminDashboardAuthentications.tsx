import { AdminStatsResponseExtended } from '@/interfaces/admin/stats';

import AdminDashboardItemLayout from './AdminDashboardItemLayout';
import AuthenticationIcon from '@/components/admin/ui/icons/AuthenticationIcon';
import AuthenticationDashboard from '../authentications/AuthenticationDashboard';
import Link from '@/components/ui/Link';

export default function AdminDashboardAuthentications({ stats } : { stats?: AdminStatsResponseExtended | null }) {
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
            stats={stats?.authEvents}
            charts={['stats', 'peak', 'duration']}
            height={100}
          />
        </Link>
      </AdminDashboardItemLayout>
    );
  }