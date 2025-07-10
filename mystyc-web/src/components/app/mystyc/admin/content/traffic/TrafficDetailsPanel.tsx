'use client';

import { TrafficStats } from '@/interfaces';

import AdminDetailGroup from '@/components/app/mystyc/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/app/mystyc/admin/ui/detail/AdminDetailField';

export default function TrafficDetailsPanel({ trafficStats }: { trafficStats: TrafficStats }) {
  // Calculate authentication percentage
  const totalUsers = trafficStats.userTypes.visitor + trafficStats.userTypes.authenticated;
  const authPercentage = totalUsers > 0 ? Math.round((trafficStats.userTypes.authenticated / totalUsers) * 100) : 0;

  // Top browser
  const topBrowser = trafficStats.browsers.length > 0 ? trafficStats.browsers[0] : null;

  // Top device type
  const topDevice = trafficStats.deviceTypes.length > 0 ? trafficStats.deviceTypes[0] : null;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AdminDetailGroup>
          <AdminDetailField
            label="Total Visits"
            value={trafficStats.visitors.totalVisits.toLocaleString()}
          />
          <AdminDetailField
            label="Authenticated Users"
            value={`${authPercentage}%`}
          />
        </AdminDetailGroup>

        <AdminDetailGroup>
          <AdminDetailField
            label="Top Browser"
            value={topBrowser && `${topBrowser.percentage}% ` + topBrowser?.browser || 'N/A'}
          />
          <AdminDetailField
            label="Top Device Type"
            value={topDevice && `${topDevice.percentage}% ` + topDevice?.type.charAt(0).toUpperCase() + topDevice?.type.slice(1) || 'N/A'}
          />
        </AdminDetailGroup>

        <AdminDetailGroup>
          <AdminDetailField
            label="Peak Hour"
            value={trafficStats.hourlyVisits.length > 0 
              ? `${trafficStats.hourlyVisits.reduce((prev, current) => 
                  prev.count > current.count ? prev : current
                ).hour}:00`
              : 'N/A'
            }
          />
          <AdminDetailField
            label="Most Active Day"
            value={trafficStats.dayOfWeekVisits.length > 0
              ? trafficStats.dayOfWeekVisits.reduce((prev, current) => 
                  prev.count > current.count ? prev : current
                ).name.charAt(0).toUpperCase() + trafficStats.dayOfWeekVisits.reduce((prev, current) => 
                  prev.count > current.count ? prev : current
                ).name.slice(1)
              : 'N/A'
            }
          />
        </AdminDetailGroup>
      </div>
    </div>
  );
}