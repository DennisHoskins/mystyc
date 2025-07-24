'use client';

import { DevicesSummary } from 'mystyc-common/admin/interfaces/summary';

import { DeviceView } from './DevicesPage'; 
import AdminDetailGroup from '@/components/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

interface DevicesSummaryPanelProps {
  summary: DevicesSummary | null,
  handleClick: (view: DeviceView) => void;
  currentView?: DeviceView;
}

export default function DevicesSummaryPanel({ summary, handleClick, currentView }: DevicesSummaryPanelProps) {
  return (
    <AdminDetailGroup>
      <AdminDetailField
        label="Online Rate"
        value={(() => {
          if (!summary) return null;

          const total = summary?.total || 0;
          const online = summary?.online || 0;
          
          if (total === 0) return "0%";
          
          const percentage = (online / total * 100).toFixed(1);
          return `${percentage}%`;
        })()}
        href='/admin/devices/'
        onClick={() => handleClick("summary")}
        active={currentView == "summary"}
      />
      <AdminDetailField
        label="All Devices"
        value={summary ? (summary.total || "0") : ""}
        href={summary?.total ? `/admin/devices?all` : null}
        onClick={() => handleClick("all")}
        active={currentView == "all"}
      />
      <AdminDetailField
        label="Online Devices"
        value={summary ? (summary.online || "0") : ""}
        href={summary?.online ? `/admin/devices?online` : null}
        onClick={() => handleClick("online")}
        active={currentView == "online"}
      />
      <AdminDetailField
        label="Offline Devices"
        value={summary ? (summary.offline || "0") : ""}
        href={summary?.offline ? `/admin/devices?offline` : null}
        onClick={() => handleClick("offline")}
        active={currentView == "offline"}
      />
    </AdminDetailGroup>
  );
}