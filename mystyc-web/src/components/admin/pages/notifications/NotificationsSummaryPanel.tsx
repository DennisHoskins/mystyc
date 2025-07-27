import { NotificationStats } from 'mystyc-common/admin/interfaces/stats';
import { AdminStatsQuery } from 'mystyc-common/admin';
import { NotificationView } from './NotificationsPage'; 
import AdminDetailGroup from '@/components/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

interface NotificationsSummaryPanelProps {
  query: Partial<AdminStatsQuery> | null,
  stats: NotificationStats | null,
  handleClick: (view: NotificationView) => void;
  currentView?: NotificationView;
}

export default function NotificationsSummaryPanel({ stats, handleClick, currentView }: NotificationsSummaryPanelProps) {
  return (
    <AdminDetailGroup>
      <AdminDetailField
        label="Success Rate"
        value={(() => {
          if (!stats) return null;

          if (!stats?.delivery?.deliveryMetrics?.successRate) return "0%";
          
          return `${stats.delivery.deliveryMetrics.successRate}%`;
        })()}
        href='/admin/notifications/'
        onClick={() => handleClick("summary")}
        active={currentView == "summary"}
      />
      <AdminDetailField
        label="All Notifications"
        value={stats ? (stats.delivery.totalNotifications || "0") : ""}
        href={stats?.delivery.totalNotifications ? `/admin/notifications?all` : null}
        onClick={() => handleClick("all")}
        active={currentView == "all"}
      />
    </AdminDetailGroup>
  );
}