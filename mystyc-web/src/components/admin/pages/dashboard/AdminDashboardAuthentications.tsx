import { AuthEventStats } from 'mystyc-common/admin';
import AdminDashboardItemLayout from './AdminDashboardItemLayout';
import AuthenticationIcon from '@/components/admin/ui/icons/AuthenticationIcon';
import AuthenticationDashboard from '../authentications/AuthenticationDashboard';
import Link from '@/components/ui/Link';

export default function AdminDashboardAuthentications({ stats, className } : { 
  stats?: AuthEventStats | null,
  className?: string
}) {
  return (
    <AdminDashboardItemLayout
      className={className}
      icon={<AuthenticationIcon />}
      title="Authentication"
      link="/admin/authentication"
      stats={
        <Link href='/admin/authentication'>
          <AuthenticationDashboard 
            stats={stats}
            charts={['stats']}
          />
        </Link>
      }
    >
      <Link
        className='flex-1 flex'
        href='/admin/authentication'
      >
        <AuthenticationDashboard 
          stats={stats}
          charts={['peak']}
        />
      </Link>
    </AdminDashboardItemLayout>
  );
}