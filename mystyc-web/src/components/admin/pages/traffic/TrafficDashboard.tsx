import { TrafficStats } from '@/interfaces/admin/stats';
import KeyStatsGrid from '@/components/admin/ui/charts/KeyStatsGrid';
import PieChartWithLegend from '@/components/admin/ui/charts/PieChartWithLegend';
import SimpleLineChart from '@/components/admin/ui/charts/SimpleLineChart';
import SimpleBarChart from '@/components/admin/ui/charts/SimpleBarChart';

type ChartType = 'stats' | 'visitors' | 'pages' | 'types' | 'browsers' | 'hourly' | 'dayofweek' | 'usertype' | 'platform' | 'browserversions';

interface TrafficDashboardProps {
  className?: string | null;
  data?: TrafficStats | null;
  charts?: ChartType[];
  height?: number | string;
  layout?: string;
  label?: boolean;
}

export default function   TrafficDashboard({ 
  className,
  data, 
  charts = ['stats', 'visitors', 'pages', 'types', 'browsers', 'hourly', 'dayofweek', 'usertype'],
  height,
  layout = 'horizontal',
  label = true
}: TrafficDashboardProps) {
  // Calculate authentication percentage
  const totalUsers = data ? (data.userTypes.visitor + data.userTypes.authenticated) : 0;
  const authPercentage = data?.userTypes && totalUsers > 0 ? Math.round((data?.userTypes.authenticated / totalUsers) * 100) : 0;

  // Transform daily visits for line chart
  const visitorData = data?.visitors.dailyVisits.map(visit => ({
    date: visit.date.split('-').slice(1).join('/'), // MM/DD format
    visits: visit.count
  }));

  // Transform top pages for bar chart (top 5)
  const pageData = data?.pages.slice(0, 5).map(page => ({
    name: page.path.split('/').pop() || page.path, // Get last part of path
    visits: page.count
  }));

  // Transform user types for pie chart
  const userTypeData = [
    { name: 'Visitors', value: data?.userTypes.visitor ?? 0, color: '#3b82f6' },
    { name: 'Authenticated', value: data?.userTypes.authenticated ?? 0, color: '#10b981' }
  ];

  // Transform browsers for pie chart (top 4)
  const browserData = data?.browsers.slice(0, 4).map(browser => ({
    name: browser.browser,
    value: browser.count,
    percentage: browser.percentage
  }));

  // Transform device types/types for pie chart
  const typeData = data?.deviceTypes.map(device => ({
    name: device.type.charAt(0).toUpperCase() + device.type.slice(1), // Capitalize
    value: device.count,
    percentage: device.percentage
  }));

  // Transform hourly visits for bar chart (top 6 hours)
  const hourlyData = data?.hourlyVisits
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(hour => ({
      hour: `${hour.hour}:00`,
      visits: hour.count
    }));

  // Transform day of week data for bar chart
  const dayOfWeekData = data?.dayOfWeekVisits.map(day => ({
    day: day.name.charAt(0).toUpperCase() + day.name.slice(1, 3), // Mon, Tue, etc.
    visits: day.count
  }));

  // Transform browser-device combinations for pie chart (top 6)
  const browserDeviceData = data?.browserDevices.slice(0, 6).map(combo => ({
    name: combo.combination,
    value: combo.count,
    percentage: combo.percentage
  }));

  // Transform browser-device detailed for bar chart (top 8)
  const browserVersionData = data?.browserDevicesDetailed
    .slice(0, 8)
    .map(combo => ({
      name: combo.combination.length > 15 ? combo.combination.substring(0, 15) + '...' : combo.combination,
      visits: combo.count
    }));

  const chartComponents = {
    stats: (
      <KeyStatsGrid 
        stats={[
          { value: data?.visitors ? data.visitors.totalVisits : "", label: 'Visits', color: 'text-blue-600' },
          { value: data?.visitors ? `${authPercentage}%` : "", label: 'Authenticated', color: 'text-green-600' }
        ]} 
      />
    ),
    visitors: (
      <SimpleLineChart 
        title={`Visitor Trend ${data ? "(" + data.visitors.dailyVisits.length + " days)" : ""}`}
        label={label}
        data={visitorData}
        dataKey="visits"
        xAxisKey="date"
        height={height}
        color="#3b82f6"
        tooltipLabel="Visits"
        showXAxisTicks={false}
        strokeWidth={2}
        showDots={true}
      />
    ),
    pages: (
      <SimpleBarChart 
        title="Top Pages"
        label={label}
        data={pageData}
        height={height}
        layout={layout}
        dataKey="visits"
        xAxisKey="name"
        color="#8b5cf6"
        tooltipLabel="Visits"
        fontSize={10}
      />
    ),
    types: (
      <PieChartWithLegend 
        title="Device Types"
        label={label}
        data={typeData}
        height={height}
        showPercentage={true}
      />
    ),
    browsers: (
      <PieChartWithLegend 
        title="Top Browsers"
        label={label}
        data={browserData}
        height={height}
        showPercentage={true}
      />
    ),
    hourly: (
      <SimpleBarChart 
        title="Peak Hours (Top 12)"
        label={label}
        data={hourlyData}
        height={height}
        layout={layout}
        dataKey="visits"
        xAxisKey="hour"
        color="#f59e0b"
        tooltipLabel="Visits"
        fontSize={10}
      />
    ),
    dayofweek: (
      <SimpleBarChart 
        title="Day of Week"
        label={label}
        data={dayOfWeekData}
        height={height}
        layout={layout}
        dataKey="visits"
        xAxisKey="day"
        color="#06b6d4"
        tooltipLabel="Visits"
        fontSize={10}
      />
    ),
    usertype: (
      <PieChartWithLegend 
        title="User Types"
        label={label}
        data={userTypeData}
        height={height}
        showPercentage={false}
        colors={['#3b82f6', '#10b981']}
      />
    ),
    platform: (
      <PieChartWithLegend 
        title="Top Platforms"
        label={label}
        data={browserDeviceData}
        height={height}
        showPercentage={true}
      />
    ),
    browserversions: (
      <SimpleBarChart 
        title="Browser Versions"
        label={label}
        data={browserVersionData}
        height={height}
        layout={layout}
        dataKey="visits"
        xAxisKey="name"
        color="#ef4444"
        tooltipLabel="Visits"
        fontSize={9}
      />
    )
  };

  return (
    <div className={`@container grow w-full flex flex-col min-h-0 ${className}`}>
      <div className={`grow min-h-0 flex flex-col @lg:grid grid-cols-${charts.length} gap-4`}>
        {charts.map((chartType) => (
          <div key={chartType} className='flex h-full w-full'>
            {chartComponents[chartType]}
          </div>
        ))}
      </div>
    </div>
  );
};