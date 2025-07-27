import { AuthEventStats } from 'mystyc-common/admin';
import AdminDashboardItemLayout from './AdminDashboardItemLayout';
import AuthenticationIcon from '@/components/admin/ui/icons/AuthenticationIcon';
import AuthenticationDashboard from '../authentications/AuthenticationDashboard';
import Link from '@/components/ui/Link';

export default function AdminDashboardAuthentications({ stats } : { 
  stats?: AuthEventStats | null 
}) {
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
            stats={stats}
            charts={['stats', 'peak', 'duration']}
            height={100}
          />
        </Link>
      </AdminDashboardItemLayout>
    );
  }