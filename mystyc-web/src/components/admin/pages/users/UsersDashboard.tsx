import { UserStats } from 'mystyc-common/admin/interfaces/stats';
import { AdminStatsQuery } from 'mystyc-common/admin';
import { formatDateRangeForComponent } from '@/util/dateTime'
import KeyStatsGrid from '@/components/admin/ui/charts/KeyStatsGrid';
import PieChartWithLegend from '@/components/admin/ui/charts/PieChartWithLegend';
import SimpleLineChart from '@/components/admin/ui/charts/SimpleLineChart';
import SimpleBarChart from '@/components/admin/ui/charts/SimpleBarChart';

type ChartType = 'stats' | 'profile' | 'registrations' | 'activity';

interface UsersDashboardProps {
  query?: Partial<AdminStatsQuery> | null;
  stats?: UserStats | null;
  charts?: ChartType[];
  height?: number;
}

export default function UsersDashboard({ 
  query,
  stats, 
  charts = ['stats', 'profile', 'registrations', 'activity'],
  height
}: UsersDashboardProps) {

  const duration = stats ? formatDateRangeForComponent(query?.startDate, query?.endDate) : "";

  // Transform profile completion data for pie chart
  const profileData = [
    { name: 'Full Name', value: stats?.profiles.completionPercentageRates.fullName || 0 },
    { name: 'Date of Birth', value: stats?.profiles.completionPercentageRates.dateOfBirth || 0 },
    { name: 'Zodiac Sign', value: stats?.profiles.completionPercentageRates.zodiacSign || 0 },
  ];

  // Transform activity data for bar chart
  const activityData = [
    { period: '24h', users: stats?.activity.activeUsers.last24Hours || 0 },
    { period: '7d', users: stats?.activity.activeUsers.last7Days || 0 },
    { period: '30d', users: stats?.activity.activeUsers.last30Days || 0 },
  ];

  const chartComponents = {
    stats: (
      <KeyStatsGrid 
        stats={[
          { value: stats?.profiles.totalUsers || "", label: 'Users', color: 'text-blue-600' },
          { value: `${stats ? stats?.profiles.completionPercentageRates.totalComplete + "%" : " %"}`, label: 'Complete', color: 'text-green-600' }
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
        title={`Registration Trend (${duration})`}
        data={stats?.registrations.data}
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