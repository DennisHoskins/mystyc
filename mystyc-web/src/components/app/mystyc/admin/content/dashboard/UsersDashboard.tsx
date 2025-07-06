'use client';

import { UserStats } from '@/interfaces';

import KeyStatsGrid from '@/components/app/mystyc/admin/ui/charts/KeyStatsGrid';
import PieChartWithLegend from '@/components/app/mystyc/admin/ui/charts/PieChartWithLegend';
import SimpleLineChart from '@/components/app/mystyc/admin/ui/charts/SimpleLineChart';
import SimpleBarChart from '@/components/app/mystyc/admin/ui/charts/SimpleBarChart';

type ChartType = 'stats' | 'profile' | 'registrations' | 'activity';

interface UsersDashboardProps {
  data?: UserStats | null;
  charts?: ChartType[];
  height?: number;
}

export default function UsersDashboard({ 
  data, 
  charts = ['stats', 'profile', 'registrations', 'activity'],
  height = 100
}: UsersDashboardProps) {
  if (!data) {
    return null;
  }

  // Transform profile completion data for pie chart
  const profileData = [
    { name: 'Full Name', value: data.profiles.completionPercentageRates.fullName },
    { name: 'Date of Birth', value: data.profiles.completionPercentageRates.dateOfBirth },
    { name: 'Zodiac Sign', value: data.profiles.completionPercentageRates.zodiacSign },
  ];

  // Transform activity data for bar chart
  const activityData = [
    { period: '24h', users: data.activity.activeUsers.last24Hours },
    { period: '7d', users: data.activity.activeUsers.last7Days },
    { period: '30d', users: data.activity.activeUsers.last30Days },
  ];

  const chartComponents = {
    stats: (
      <KeyStatsGrid 
        stats={[
          { value: data.profiles.totalUsers, label: 'Total Users', color: 'text-blue-600' },
          { value: `${data.profiles.completionPercentageRates.totalComplete}%`, label: 'Complete Profiles', color: 'text-green-600' }
        ]} 
      />
    ),
    profile: (
      <PieChartWithLegend 
        title="Profile Completion"
        data={profileData}
        height={height}
        showPercentage={true}
      />
    ),
    registrations: (
      <SimpleLineChart 
        title="Registration Trend (30 days)"
        data={data.registrations.data}
        height={height}
        dataKey="count"
        xAxisKey="date"
        tooltipLabel="Registrations"
      />
    ),
    activity: (
      <SimpleBarChart 
        title="Active Users"
        data={activityData}
        height={height}
        dataKey="users"
        xAxisKey="period"
        color="#10b981"
        tooltipLabel="Active Users"
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