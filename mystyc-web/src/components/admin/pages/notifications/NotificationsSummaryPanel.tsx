'use client';

import { NotificationStats } from 'mystyc-common/admin/interfaces/stats';
import { AdminStatsResponseWithQuery } from 'mystyc-common/admin/interfaces/responses/admin-stats-response.interface';

import { NotificationView } from './NotificationsPage'; 
import AdminDetailGroup from '@/components/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

interface NotificationsSummaryPanelProps {
  stats: AdminStatsResponseWithQuery<NotificationStats> | null,
  handleClick: (view: NotificationView) => void;
  currentView?: NotificationView;
}

export default function NotificationsSummaryPanel({ stats, handleClick, currentView }: NotificationsSummaryPanelProps) {
  return (
    <AdminDetailGroup>
      <AdminDetailField
        label="Success Rate"
        value={(() => {
          if (!stats || !stats.data) return null;

          if (!stats?.data?.delivery?.deliveryMetrics?.successRate) return "0%";
          
          return `${stats.data.delivery.deliveryMetrics.successRate}%`;
        })()}
        href='/admin/notifications/'
        onClick={() => handleClick("summary")}
        active={currentView == "summary"}
      />
      <AdminDetailField
        label="All Notifications"
        value={stats ? (stats.data.delivery.totalNotifications || "0") : ""}
        href={stats?.data.delivery.totalNotifications ? `/admin/notifications?all` : null}
        onClick={() => handleClick("all")}
        active={currentView == "all"}
      />
    </AdminDetailGroup>
  );
}