import { SubscriptionStats } from 'mystyc-common/admin';
import Link from '@/components/ui/Link';
import SubscriberIcon from '@/components/admin/ui/icons/SubscriberIcon'
import AdminDashboardItemLayout from './AdminDashboardItemLayout';
import SubscriptionsDashboard  from '../subscriptions/SubscriptionsDashboard';

export default function AdminDashboardSubscriptions({ stats, className } : { 
  stats?: SubscriptionStats | null,
  className?: string
}) {
  return (
    <AdminDashboardItemLayout
      className={className}
      icon={<SubscriberIcon />}
      title="Subscriptions"
      link="/admin/subscriptions"
      stats={
        <Link href='/admin/subscriptions'>
          <SubscriptionsDashboard
            stats={stats}
            charts={['stats']}
          />
        </Link>
      }
    >
      <Link
        className='flex-1 flex flex-col'
        href='/admin/subscriptions'
      >
        <SubscriptionsDashboard
          stats={stats}
          charts={['mrr']}
        />
      </Link>
    </AdminDashboardItemLayout>
  );
}