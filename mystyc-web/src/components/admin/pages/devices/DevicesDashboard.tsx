import { DeviceStats } from 'mystyc-common/admin/interfaces/stats';
import KeyStatsGrid from '@/components/admin/ui/charts/KeyStatsGrid';
import PieChartWithLegend from '@/components/admin/ui/charts/PieChartWithLegend';
import SimpleBarChart from '@/components/admin/ui/charts/SimpleBarChart';

type ChartType = 'stats' | 'platforms' | 'browsers' | 'activity';

interface DevicesDashboardProps {
  stats?: DeviceStats | null;
  charts?: ChartType[];
  height?: number;
}

export default function DevicesDashboard({ 
  stats, 
  charts = ['stats', 'platforms', 'browsers', 'activity'],
  height
}: DevicesDashboardProps) {
  // Transform platform data for pie chart
  const platformData = stats?.platforms.platforms.map(platform => ({
    name: platform.platform,
    value: platform.count,
    percentage: platform.percentage
  }));

  // Transform browser data for bar chart
  const browserData = stats?.userAgents.browsers.slice(0, 4).map(browser => ({
    name: browser.browser,
    count: browser.count
  }));

  // Transform activity data for bar chart
  const activityData = [
    { period: '24h', devices: stats?.activity.activeDevices.last24Hours ?? 0 },
    { period: '7d', devices: stats?.activity.activeDevices.last7Days ?? 0 },
    { period: '30d', devices: stats?.activity.activeDevices.last30Days ?? 0 },
  ];

  const chartComponents = {
    stats: (
      <KeyStatsGrid 
        stats={[
          { value: stats ? stats.platforms.totalDevices : "", label: 'Devices', color: 'text-blue-600' },
          { value: stats ? `${stats.fcmTokens.fcmTokenCoverage + "%"}` : "", label: 'Push', color: 'text-green-600' }
        ]} 
      />
    ),
    platforms: (
      <PieChartWithLegend 
        title="Platform Distribution"
        data={platformData}
        height={height}
        showPercentage={true}
      />
    ),
    browsers: (
      <SimpleBarChart 
        title="Top Browsers"
        data={browserData}
        height={height}
        dataKey="count"
        xAxisKey="name"
        color="#8b5cf6"
        tooltipLabel="Devices"
      />
    ),
    activity: (
      <SimpleBarChart 
        title="Active Devices"
        data={activityData}
        height={height}
        dataKey="devices"
        xAxisKey="period"
        color="#ef4444"
        tooltipLabel="Active Devices"
      />
    )
  };

  return (
    <div className="@container grow flex flex-col">
      <div className={`flex-1 flex flex-col @lg:grid grid-cols-${charts.length} gap-4`}>
        {charts.map((chartType) => (
          <div key={chartType} className='flex h-full'>
            {chartComponents[chartType]}
          </div>
        ))}
      </div>
    </div>
  );
};