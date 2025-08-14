import { AuthEventStats } from 'mystyc-common/admin/interfaces/stats';
import KeyStatsGrid from '@/components/admin/ui/charts/KeyStatsGrid';
import PieChartWithLegend from '@/components/admin/ui/charts/PieChartWithLegend';
import SimpleBarChart from '@/components/admin/ui/charts/SimpleBarChart';

type ChartType = 'stats' | 'events' | 'peak' | 'duration';

interface AuthenticationDashboardProps {
  stats?: AuthEventStats | null | undefined;
  charts?: ChartType[];
  height?: number;
}

export default function AuthenticationDashboard({ 
  stats, 
  charts = ['stats', 'events', 'peak', 'duration'],
  height
}: AuthenticationDashboardProps) {
  // Transform event types for pie chart
  const eventTypeData = stats?.summary.eventsByType.map(event => ({
    name: event.type,
    value: event.count,
    percentage: event.percentage
  }));

  // Transform peak hours for bar chart (top 12 hours)
  const peakHoursData = stats?.pattern.peakHours.slice(0, 12).map(hour => ({
    hour: `${hour.hour}:00`,
    count: hour.count
  }));

  // Transform session duration for bar chart
  const sessionData = stats?.duration.sessionDurations.map(session => ({
    range: session.range,
    count: session.count,
    percentage: session.percentage
  }));

  const chartComponents = {
    stats: (
      <KeyStatsGrid 
        stats={[
          { value: stats?.summary.totalEvents ?? "", label: 'Events', color: 'text-blue-600' },
          { value: stats?.pattern.loginFrequency.averageLoginsPerUser ?? "", label: 'Logins/User', color: 'text-green-600' }
        ]} 
      />
    ),
    events: (
      <PieChartWithLegend 
        title="Event Types"
        data={eventTypeData}
        height={height}
        showPercentage={true}
      />
    ),
    peak: (
      <SimpleBarChart 
        title="Peak Hours (Top 12)"
        data={peakHoursData}
        height={height}
        dataKey="count"
        xAxisKey="hour"
        color="#10b981"
        tooltipLabel="Events"
        fontSize={10}
      />
    ),
    duration: (
      <SimpleBarChart 
        title="Session Duration"
        data={sessionData}
        height={height}
        dataKey="count"
        xAxisKey="range"
        color="#f59e0b"
        tooltipLabel="Sessions"
        fontSize={10}
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