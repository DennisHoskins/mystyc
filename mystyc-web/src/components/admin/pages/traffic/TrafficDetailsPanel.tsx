import { TrafficStats } from '@/interfaces/admin/stats';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function TrafficDetailsPanel({ trafficStats }: { trafficStats?: TrafficStats | null }) {
  // Calculate authentication percentage
  const totalUsers = trafficStats ? (trafficStats.userTypes.visitor + trafficStats.userTypes.authenticated) : 0;
  const authPercentage = trafficStats?.userTypes && totalUsers > 0 ? Math.round((trafficStats?.userTypes.authenticated / totalUsers) * 100) : 0;

  // Top browser
  const topBrowser = trafficStats?.browsers && trafficStats?.browsers.length > 0 ? trafficStats?.browsers[0] : null;

  // Top device type
  const topDevice = trafficStats?.deviceTypes && trafficStats?.deviceTypes.length > 0 ? trafficStats?.deviceTypes[0] : null;

  return (
    <>
      <AdminDetailGrid cols={3}>
        <AdminDetailField
          label="Total Visits"
          value={trafficStats && trafficStats.visitors.totalVisits.toLocaleString()}
        />
        <AdminDetailField
          label="Authenticated Users"
          value={trafficStats && `${authPercentage}%`}
        />
        <AdminDetailField
          label="Top Browser"
          value={topBrowser && (`${topBrowser.percentage}% ` + topBrowser?.browser || 'N/A')}
        />
        <AdminDetailField
          label="Top Device Type"
          value={topDevice && (`${topDevice.percentage}% ` + topDevice?.type.charAt(0).toUpperCase() + topDevice?.type.slice(1) || 'N/A')}
        />
        <AdminDetailField
          label="Peak Hour"
          value={trafficStats && ((trafficStats?.hourlyVisits.length ?? 0) > 0 
            ? `${trafficStats?.hourlyVisits.reduce((prev, current) => 
                prev.count > current.count ? prev : current
              ).hour}:00`
            : 'N/A')
          }
        />
        <AdminDetailField
          label="Most Active Day"
          value={trafficStats && (trafficStats?.dayOfWeekVisits.length > 0
            ? trafficStats?.dayOfWeekVisits.reduce((prev, current) => 
                prev.count > current.count ? prev : current
              ).name.charAt(0).toUpperCase() + trafficStats?.dayOfWeekVisits.reduce((prev, current) => 
                prev.count > current.count ? prev : current
              ).name.slice(1)
            : 'N/A')
          }
        />
      </AdminDetailGrid>
    </>
  );
}