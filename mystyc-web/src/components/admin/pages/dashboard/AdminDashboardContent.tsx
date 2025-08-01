import { ContentStats } from 'mystyc-common/admin';
import AdminDashboardItemLayout from './AdminDashboardItemLayout';
import ContentIcon from '@/components/admin/ui/icons/ContentIcon';
import ContentDashboard from '../contents/ContentDashboard';
import Link from '@/components/ui/Link';

export default function AdminDashboardContent({ stats } : { 
  stats?: ContentStats | null 
}) {
  return (
    <AdminDashboardItemLayout
      className='col-span-2'
      icon={<ContentIcon />}
      title="Content Generation"
      link="/admin/content"
    >
      <Link 
        href='admin/content'
        className='space-x-4 flex flex-1'
      >
        <div className='flex-1 flex flex-col space-y-4 xl:flex-row xl:space-x-4 xl:space-y-0 min-h-40'>
          <ContentDashboard 
            className='w-full xl:w-64'
            stats={stats}
            charts={['stats']}
          />
          <ContentDashboard 
            className='w-full'
            stats={stats}
            charts={['timeline']}
          />
        </div>
      </Link>
    </AdminDashboardItemLayout>
  );
}