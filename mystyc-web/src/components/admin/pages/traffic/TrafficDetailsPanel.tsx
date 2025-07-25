import { TrafficStats } from '@/interfaces/admin/stats';

import AdminDetailGroup from '@/components/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function TrafficDetailsPanel({ trafficStats }: { trafficStats?: TrafficStats | null }) {
  // Calculate authentication percentage
  const totalUsers = trafficStats?.userTypes.visitor ?? 0 + (trafficStats?.userTypes.authenticated ?? 0);
  const authPercentage = totalUsers > 0 ? Math.round((trafficStats?.userTypes.authenticated ?? 0 / totalUsers) * 100) : 0;

  // Top browser
  const topBrowser = trafficStats?.browsers && trafficStats?.browsers.length > 0 ? trafficStats?.browsers[0] : null;

  // Top device type
  const topDevice = trafficStats?.deviceTypes && trafficStats?.deviceTypes.length > 0 ? trafficStats?.deviceTypes[0] : null;

  return (
    <AdminDetailGroup cols={3}>
      <AdminDetailField
        label="Total Visits"
        value={trafficStats?.visitors.totalVisits.toLocaleString()}
      />
      <AdminDetailField
        label="Authenticated Users"
        value={`${authPercentage}%`}
      />
      <AdminDetailField
        label="Top Browser"
        value={topBrowser && `${topBrowser.percentage}% ` + topBrowser?.browser || 'N/A'}
      />
      <AdminDetailField
        label="Top Device Type"
        value={topDevice && `${topDevice.percentage}% ` + topDevice?.type.charAt(0).toUpperCase() + topDevice?.type.slice(1) || 'N/A'}
      />
      <AdminDetailField
        label="Peak Hour"
        value={(trafficStats?.hourlyVisits.length ?? 0) > 0 
          ? `${trafficStats?.hourlyVisits.reduce((prev, current) => 
              prev.count > current.count ? prev : current
            ).hour}:00`
          : 'N/A'
        }
      />
      <AdminDetailField
        label="Most Active Day"
        value={trafficStats && trafficStats?.dayOfWeekVisits.length > 0
          ? trafficStats?.dayOfWeekVisits.reduce((prev, current) => 
              prev.count > current.count ? prev : current
            ).name.charAt(0).toUpperCase() + trafficStats?.dayOfWeekVisits.reduce((prev, current) => 
              prev.count > current.count ? prev : current
            ).name.slice(1)
          : 'N/A'
        }
      />
    </AdminDetailGroup>
  );
}