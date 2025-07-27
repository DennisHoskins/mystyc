import { SubscriptionsSummary } from 'mystyc-common/admin/interfaces/summary';
import { SubscriptionStats } from 'mystyc-common/admin/interfaces/stats';
import { SubscriptionView } from './SubscriptionsPage'; 
import AdminDetailGroup from '@/components/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

interface SubscriptionsSummaryPanelProps {
  summary: SubscriptionsSummary | null,
  stats: SubscriptionStats | null,
  handleClick: (view: SubscriptionView) => void;
  currentView?: SubscriptionView;
}

export default function SubscriptionsSummaryPanel({ summary, stats, handleClick, currentView }: SubscriptionsSummaryPanelProps) {
  return (
    <AdminDetailGroup cols={3}>
      <AdminDetailField
        label="Current MRR"
        value={(() => {
          if (!stats) return null;

          if (!stats?.summary?.currentMRR) return "$0";
          
          return `$${stats.summary.currentMRR.toLocaleString()}`;
        })()}
        href='/admin/subscriptions/'
        onClick={() => handleClick("summary")}
        active={currentView == "summary"}
      />
      <AdminDetailField
        label="Payments"
        value={summary ? (summary.totalPayments || "0") : ""}
        href={summary?.totalPayments ? `/admin/subscriptions?payments` : null}
        onClick={() => handleClick("payments")}
        active={currentView == "payments"}
      />
      <AdminDetailField
        label="Subscribers"
        value={summary ? (summary.totalSubscriptions || "0") : ""}
        href={summary?.totalSubscriptions ? `/admin/subscriptions?subscribers` : null}
        onClick={() => handleClick("subscribers")}
        active={currentView == "subscribers"}
      />
    </AdminDetailGroup>
  );
}