'use client';

import { Clock, Calendar } from 'lucide-react';

import { ScheduleStats } from '@/interfaces';

import KeyStatsGrid from '@/components/app/mystyc/admin/ui/charts/KeyStatsGrid';
import PieChartWithLegend from '@/components/app/mystyc/admin/ui/charts/PieChartWithLegend';
import SimpleBarChart from '@/components/app/mystyc/admin/ui/charts/SimpleBarChart';

type ChartType = 'stats' | 'events' | 'upcoming' | 'status' | 'health' | 'next';

interface ScheduleDashboardProps {
  data?: ScheduleStats | null;
  charts?: ChartType[];
  height?: number;
  className?: string | null;
}

export default function ScheduleDashboard({ 
  data, 
  charts = ['stats', 'events', 'upcoming', 'health', 'status', 'next'], 
  height = 100,
  className
}: ScheduleDashboardProps) {
  if (!data) {
    return null;
  }

  // Transform event name distribution for pie chart
  const eventData = data.summary.schedulesByEventName.map(event => ({
    name: event.eventName.replace(/\./g, ' ').replace(/^[a-z]/, (match) => match.toUpperCase()), // Format event names
    value: event.count,
    percentage: Math.round((event.count / data.summary.totalSchedules) * 100)
  }));

  // Transform upcoming executions for bar chart (next 5)
  const upcomingData = data.performance.upcomingExecutions.slice(0, 5).map(execution => {
    const now = new Date();
    const nextExecution = new Date(execution.nextExecution); // Convert to Date
    const diff = nextExecution.getTime() - now.getTime();
    const hoursUntil = Math.max(0, Math.round(diff / (1000 * 60 * 60)));
    
    return {
      name: execution.eventName.split('.').pop() || execution.eventName,
      hoursUntil: hoursUntil
    };
  });

  // Transform schedule status for pie chart
  const statusData = [
    { name: 'Enabled', value: data.summary.enabledSchedules, color: '#10b981' },
    { name: 'Disabled', value: data.summary.disabledSchedules, color: '#ef4444' }
  ];

  // Transform schedule types for additional chart
  // const typeData = [
  //   { name: 'Timezone Aware', value: data.summary.timezoneAwareSchedules, color: '#3b82f6' },
  //   { name: 'Global', value: data.summary.globalSchedules, color: '#8b5cf6' }
  // ];

  const chartComponents = {
    stats: (
      <KeyStatsGrid 
        stats={[
          { value: data.summary.totalSchedules, label: 'Total Schedules', color: 'text-blue-600' },
          { value: data.summary.enabledSchedules, label: 'Active', color: 'text-green-600' }
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
      <div className="@container grow flex flex-col">
        {/* Schedule Health Indicator */}
        <div className={`inline-flex items-center w-full p-4 rounded-lg justify-center md:justify-start ${
          data.summary.enabledSchedules > 0 ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <Clock className={`w-6 h-6 mr-4 ${
            data.summary.enabledSchedules > 0 ? 'text-green-600' : 'text-red-600'
          }`} />
          <div>
            <div className={`overflow-hidden font-medium text-sm leading-relaxed ${
              data.summary.enabledSchedules > 0 ? 'text-green-700' : 'text-red-700'
            }`}>
              <span className='@[200px]:hidden'>
                {data.summary.enabledSchedules > 0 ? 'Active' : 'Inactive'}
              </span>
              <span className='hidden @[200px]:inline'>
                {data.summary.enabledSchedules > 0 ? 'Scheduler Active' : 'No Active Schedules'}
              </span>
            </div>

            <div className="text-xs text-gray-600 leading-relaxed">
              <span className='@[200px]:hidden'>
                {data.summary.enabledSchedules > 0 
                  ? `${data.summary.enabledSchedules} running`
                  : 'All disabled'
                }
              </span>
              <span className='hidden @[200px]:inline'>
                {data.summary.enabledSchedules > 0 
                  ? `${data.summary.enabledSchedules} schedules running`
                  : 'All schedules are disabled'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    next: (
      <div className="@container grow flex flex-col">
        {/* Schedule Health Indicator */}
        <div className={`inline-flex items-center w-full p-4 rounded-lg bg-gray-50 justify-center md:justify-start `}>
          <Calendar className="w-6 h-6 mr-4 text-gray-500" />
          <div>
            <div className={`overflow-hidden font-medium text-sm `}>
              <span className='@[200px]:hidden'>
                Next:
              </span>
              <span className='hidden @[200px]:inline'>
                Next Execution:
              </span>
            </div>

            <div className="text-xs text-gray-600 leading-relaxed">
              <span className='@[200px]:hidden'>
                {data.performance.upcomingExecutions[0].scheduledTime}
                <br />
                {data.performance.upcomingExecutions[0].timezoneAware && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">timezone</span>
                )}
              </span>
              <span className='hidden @[200px]:inline'>
                {data.performance.upcomingExecutions[0].eventName}
                <br />
                {data.performance.upcomingExecutions[0].scheduledTime}
                {data.performance.upcomingExecutions[0].timezoneAware && (
                  <span className=" ml-2 text-xs bg-blue-100 text-blue-700 px-1 rounded">timezone-aware</span>
                )}
              </span>
            </div>
          </div>
        </div>
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
};