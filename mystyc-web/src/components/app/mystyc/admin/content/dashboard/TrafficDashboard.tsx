'use client';

import { TrafficStats } from '@/interfaces';

import KeyStatsGrid from '@/components/app/mystyc/admin/ui/charts/KeyStatsGrid';
import PieChartWithLegend from '@/components/app/mystyc/admin/ui/charts/PieChartWithLegend';
import SimpleLineChart from '@/components/app/mystyc/admin/ui/charts/SimpleLineChart';
import SimpleBarChart from '@/components/app/mystyc/admin/ui/charts/SimpleBarChart';

type ChartType = 'stats' | 'visitors' | 'pages' | 'platforms' | 'browsers' | 'hourly' | 'dayofweek' | 'usertype';

interface TrafficDashboardProps {
  data?: TrafficStats | null;
  charts?: ChartType[];
  height?: number;
}

export default function TrafficDashboard({ 
  data, 
  charts = ['stats', 'visitors', 'pages', 'platforms', 'browsers', 'hourly', 'dayofweek', 'usertype'],
  height = 100
}: TrafficDashboardProps) {
  if (!data) {
    return null;
  }

  // Calculate authentication percentage
  const totalUsers = data.userTypes.visitor + data.userTypes.authenticated;
  const authPercentage = totalUsers > 0 ? Math.round((data.userTypes.authenticated / totalUsers) * 100) : 0;

  // Transform daily visits for line chart
  const visitorData = data.visitors.dailyVisits.map(visit => ({
    date: visit.date.split('-').slice(1).join('/'), // MM/DD format
    visits: visit.count
  }));

  // Transform top pages for bar chart (top 5)
  const pageData = data.pages.slice(0, 5).map(page => ({
    name: page.path.split('/').pop() || page.path, // Get last part of path
    visits: page.count
  }));

  // Transform user types for pie chart
  const userTypeData = [
    { name: 'Visitors', value: data.userTypes.visitor, color: '#3b82f6' },
    { name: 'Authenticated', value: data.userTypes.authenticated, color: '#10b981' }
  ];

  // Transform browsers for pie chart (top 4)
  const browserData = data.browsers.slice(0, 4).map(browser => ({
    name: browser.browser,
    value: browser.count,
    percentage: browser.percentage
  }));

  // Transform device types/platforms for pie chart
  const platformData = data.deviceTypes.map(device => ({
    name: device.type.charAt(0).toUpperCase() + device.type.slice(1), // Capitalize
    value: device.count,
    percentage: device.percentage
  }));

  // Transform hourly visits for bar chart (top 12 hours)
  const hourlyData = data.hourlyVisits
    .sort((a, b) => b.count - a.count)
    .slice(0, 12)
    .map(hour => ({
      hour: `${hour.hour}:00`,
      visits: hour.count
    }));

  // Transform day of week data for bar chart
  const dayOfWeekData = data.dayOfWeekVisits.map(day => ({
    day: day.name.charAt(0).toUpperCase() + day.name.slice(1, 3), // Mon, Tue, etc.
    visits: day.count
  }));

  const chartComponents = {
    stats: (
      <KeyStatsGrid 
        stats={[
          { value: data.visitors.totalVisits, label: 'Total Visits', color: 'text-blue-600' },
          { value: `${authPercentage}%`, label: 'Authenticated', color: 'text-green-600' }
        ]} 
      />
    ),
    visitors: (
      <SimpleLineChart 
        title={`Visitor Trend (${data.visitors.dailyVisits.length} days)`}
        data={visitorData}
        height={height}
        dataKey="visits"
        xAxisKey="date"
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
        data={pageData}
        height={height}
        dataKey="visits"
        xAxisKey="name"
        color="#8b5cf6"
        tooltipLabel="Visits"
        fontSize={10}
      />
    ),
    platforms: (
      <PieChartWithLegend 
        title="Device Types"
        data={platformData}
        height={height}
        showPercentage={true}
      />
    ),
    browsers: (
      <PieChartWithLegend 
        title="Top Browsers"
        data={browserData}
        height={height}
        showPercentage={true}
      />
    ),
    hourly: (
      <SimpleBarChart 
        title="Peak Hours (Top 12)"
        data={hourlyData}
        height={height}
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
        data={dayOfWeekData}
        height={height}
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
        data={userTypeData}
        height={height}
        showPercentage={false}
        colors={['#3b82f6', '#10b981']}
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