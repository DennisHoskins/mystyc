import { OpenAIUsageStats } from 'mystyc-common/admin';
import Link from '@/components/ui/Link';
import OpenAIIcon from '@/components/admin/ui/icons/OpenAIIcon'
import AdminDashboardItemLayout from './AdminDashboardItemLayout';
import OpenAIUsageDashboard from '../openai/OpenAIUsageDashboard';

export default function AdminDashboardOpenAI({ stats, className } : { 
  stats?: OpenAIUsageStats | null,
  className?: string 
}) {
  return (
    <AdminDashboardItemLayout
      className={className}
      icon={<OpenAIIcon />}
      title="Open AI"
      link="/admin/openai"
      stats={
        <Link href='/admin/openai'>
          <OpenAIUsageDashboard
            stats={stats}
            charts={['stats']}
          />
        </Link>
      }
    >
      <Link
        className='flex-1 flex flex-col'
        href='/admin/openai'
      >
        <OpenAIUsageDashboard
          stats={stats}
          charts={['budget']}
        />
      </Link>
    </AdminDashboardItemLayout>
  );
}