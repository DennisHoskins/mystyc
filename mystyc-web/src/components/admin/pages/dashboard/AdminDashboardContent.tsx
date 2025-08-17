import { ContentStats, AdminStatsQuery } from 'mystyc-common/admin';
import AdminDashboardItemLayout from './AdminDashboardItemLayout';
import ContentIcon from '@/components/admin/ui/icons/ContentIcon';
import ContentDashboard from '../contents/ContentDashboard';
import Link from '@/components/ui/Link';

export default function AdminDashboardContent({ stats, query, className } : { 
  stats?: ContentStats | null,
  query?: Partial<AdminStatsQuery> | null, 
  className?: string
}) {
  return (
    <AdminDashboardItemLayout
      className={className}
      icon={<ContentIcon />}
      title="Content Generation"
      link="/admin/content"
      stats={
        <Link href='/admin/content'>
          <ContentDashboard 
            stats={stats}
            charts={['stats']}
          />
        </Link>
      }
    >
      <Link 
        href='admin/content'
        className='flex flex-1'
      >
        <ContentDashboard 
          query={query}
          stats={stats}
          charts={['timeline']}
        />
      </Link>
    </AdminDashboardItemLayout>
  );
}