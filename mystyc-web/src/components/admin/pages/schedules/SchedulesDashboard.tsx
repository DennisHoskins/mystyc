import { Clock, CalendarClock } from 'lucide-react';

import { ScheduleStats } from 'mystyc-common/admin/interfaces/stats';

import { StatsResponseWithQuery } from '@/api/apiClientAdmin';

import StatusCard from '@/components/admin/ui/charts/StatusCard';
import KeyStatsGrid from '@/components/admin/ui/charts/KeyStatsGrid';
import PieChartWithLegend from '@/components/admin/ui/charts/PieChartWithLegend';
import SimpleBarChart from '@/components/admin/ui/charts/SimpleBarChart';

type ChartType = 'stats' | 'events' | 'upcoming' | 'status' | 'health' | 'today';

interface SchedulesDashboardProps {
  stats?: StatsResponseWithQuery<ScheduleStats> | null;
  charts?: ChartType[];
  height?: number;
  className?: string | null;
}

export default function SchedulesDashboard({ 
  stats, 
  charts = ['stats', 'events', 'upcoming', 'health', 'status', 'today'], 
  height = 100,
  className
}: SchedulesDashboardProps) {
  if (!stats) {
    return null;
  }

  // Transform event name distribution for pie chart
  const eventData = stats.data.summary.schedulesByEventName.map(event => ({
    name: event.eventName.replace(/\./g, ' ').replace(/^[a-z]/, (match) => match.toUpperCase()), // Format event names
    value: event.count,
    percentage: Math.round((event.count / stats.data.summary.totalSchedules) * 100)
  }));

  // Transform upcoming executions for bar chart (next 5)
  const upcomingData = stats.data.performance.upcomingExecutions.slice(0, 5).map(execution => {
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
    const scheduledEntries = stats.data.performance.upcomingExecutions.map(e => {
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
    if (!scheduledEntries.length) {
      return {entry: null,  date: null};
    }
    scheduledEntries.sort((a, b) => a.date.getTime() - b.date.getTime());
    return scheduledEntries[0];
  };

  const { entry: nextEntry, date: nextDate } = getNextExecutionEntry();

  // Transform schedule status for pie chart
  const statusData = [
    { name: 'Enabled', value: stats.data.summary.enabledSchedules, color: '#10b981' },
    { name: 'Disabled', value: stats.data.summary.disabledSchedules, color: '#ef4444' }
  ];

  const chartComponents = {
    stats: (
      <KeyStatsGrid 
        stats={[
          { value: stats.data.summary.totalSchedules, label: 'Total Schedules', color: 'text-blue-600' },
          { value: stats.data.summary.enabledSchedules, label: 'Active', color: 'text-green-600' }
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
        iconColor={stats.data.summary.enabledSchedules > 0 ? 'text-green-600' : 'text-red-600'}
        backgroundColor={stats.data.summary.enabledSchedules > 0 ? 'bg-green-50' : 'bg-red-50'}
        textColor={stats.data.summary.enabledSchedules > 0 ? 'text-green-700' : 'text-red-700'}
        shortText={stats.data.summary.enabledSchedules > 0 ? 'Active' : 'Inactive'}
        longText={stats.data.summary.enabledSchedules > 0 ? 'Scheduler Active' : 'No Active Schedules'}
        shortSubtext={stats.data.summary.enabledSchedules > 0 
          ? `${stats.data.summary.enabledSchedules} running`
          : 'All disabled'
        }
        longSubtext={stats.data.summary.enabledSchedules > 0 
          ? `${stats.data.summary.enabledSchedules} schedules running`
          : 'All schedules are disabled'
        }
      />
    ),
    today: nextEntry && nextDate ? (
      <StatusCard
        icon={CalendarClock}
        iconColor="text-gray-500"
        backgroundColor="bg-gray-50"
        shortText='Next:'
        shortSubtext={`@${nextEntry.scheduledTime}`}
        longText="Next Execution:"
        longSubtext={
          <>
            <div className='text-lg mb-1'>{`@${nextEntry.scheduledTime}`}</div>
            {nextEntry.timezoneAware && (
              <div className="mt-2">
                <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">
                  timezone-aware
                </span>
              </div>
            )}
          </>
        }
        badge={nextEntry.timezoneAware && (
          <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">
            timezone
          </span>
        )}
      />
    ) : (
      <div className="flex items-center justify-center w-full h-full text-gray-500 bg-gray-100">
        <p className='p-4 text-sm'>No upcoming schedules</p>
      </div>
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
