import { Clock, CalendarClock } from 'lucide-react';

import { ScheduleStats } from 'mystyc-common/admin/interfaces/stats';
import StatusCard from '@/components/admin/ui/charts/StatusCard';
import KeyStatsGrid from '@/components/admin/ui/charts/KeyStatsGrid';
import PieChartWithLegend from '@/components/admin/ui/charts/PieChartWithLegend';
import SimpleBarChart from '@/components/admin/ui/charts/SimpleBarChart';

type ChartType = 'stats' | 'events' | 'upcoming' | 'status' | 'health' | 'today';

interface SchedulesDashboardProps {
  stats?: ScheduleStats | null;
  charts?: ChartType[];
  height?: number;
  className?: string | null;
}

export default function SchedulesDashboard({ 
  stats, 
  charts = ['stats', 'events', 'upcoming', 'health', 'status', 'today'], 
  height,
  className
}: SchedulesDashboardProps) {
  // Transform event name distribution for pie chart
  const eventData = stats?.summary.schedulesByEventName.map(event => ({
    name: event.eventName.replace(/\./g, ' ').replace(/^[a-z]/, (match) => match.toUpperCase()), // Format event names
    value: event.count,
    percentage: Math.round((event.count / stats?.summary.totalSchedules) * 100)
  }));

  // Transform upcoming executions for bar chart (next 5)
  const upcomingData = stats?.performance.upcomingExecutions.slice(0, 5).map(execution => {
    const now = new Date();
    const nextExecution = new Date(execution.nextExecution); // Convert to Date
    const diff = nextExecution.getTime() - now.getTime();
    const hoursUntil = Math.max(0, Math.round(diff / (1000 * 60 * 60)));
    
    return {
      name: execution.eventName.split('.').pop() || execution.eventName,
      hoursUntil
    };
  });

  // Helper to pick the actual next execution based on local time
  const getNextExecutionEntry = () => {
    const now = new Date();
    const scheduledEntries = stats?.performance.upcomingExecutions.map(e => {
      const [hourStr, minuteStr] = e.scheduledTime.split(':');
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);
      const sched = new Date(now);
      sched.setHours(hour, minute, 0, 0);
      if (sched <= now) {
        sched.setDate(sched.getDate() + 1);
      }
      return { entry: e, date: sched };
    });
    if (!scheduledEntries || !scheduledEntries.length) {
      return {entry: null,  date: null};
    }
    scheduledEntries.sort((a, b) => a.date.getTime() - b.date.getTime());
    return scheduledEntries[0];
  };

  const { entry: nextEntry, date: nextDate } = getNextExecutionEntry();

  // Transform schedule status for pie chart
  const statusData = [
    { name: 'Enabled', value: stats?.summary.enabledSchedules ?? 0, color: '#10b981' },
    { name: 'Disabled', value: stats?.summary.disabledSchedules ?? 0, color: '#ef4444' }
  ];

  const chartComponents = {
    stats: (
      <KeyStatsGrid 
        stats={[
          { value: stats?.summary.totalSchedules ?? 0, label: 'Total Schedules', color: 'text-blue-600' },
          { value: stats?.summary.enabledSchedules ?? 0, label: 'Active', color: 'text-green-600' }
        ]} 
      />
    ),
    events: (
      <PieChartWithLegend 
        title="Event Distribution"
        data={eventData}
        height={height}
        showPercentage={true}
      />
    ),
    upcoming: (
      <SimpleBarChart 
        title="Next Executions"
        data={upcomingData}
        height={height}
        dataKey="hoursUntil"
        xAxisKey="name"
        color="#f59e0b"
        tooltipLabel="Hours Until"
        fontSize={10}
      />
    ),
    status: (
      <PieChartWithLegend 
        title="Schedule Status"
        data={statusData}
        height={height}
        showPercentage={false}
        colors={['#10b981', '#ef4444']}
      />
    ),

    health: (
      <StatusCard
        icon={Clock}
        iconColor={stats?.summary && stats?.summary.enabledSchedules > 0 ? 'text-green-600' : stats ? 'text-red-600' : 'text-gray-500'}
        backgroundColor={stats?.summary && stats?.summary.enabledSchedules > 0 ? 'bg-[#230537]' : stats ? 'bg-red-50' : 'bg-[#230537]'}
        textColor={stats?.summary && stats?.summary.enabledSchedules > 0 ? 'text-green-700' : 'text-red-700'}
        text={stats?.summary && stats?.summary.enabledSchedules > 0 ? 'Active' : 'Inactive'}
      />
    ),
    today: nextEntry && nextDate ? (
      <StatusCard
        icon={CalendarClock}
        iconColor="text-gray-500"
        textColor='text-gray-500'
        text={`${nextEntry.scheduledTime}`}
      />
    ) : (
      <StatusCard
        icon={CalendarClock}
        iconColor="text-gray-500"
        text={stats ? `No Schedules` : ""}
      />
    )
  };

  return (
    <div className={`@container grow flex flex-col ${className}`}>
      <div className={`flex-1 flex flex-col @lg:grid grid-cols-${charts.length} gap-2`}>
        {charts.map((chartType) => (
          <div key={chartType} className='flex h-full'>
            {chartComponents[chartType]}
          </div>
        ))}
      </div>
    </div>
  );
}
