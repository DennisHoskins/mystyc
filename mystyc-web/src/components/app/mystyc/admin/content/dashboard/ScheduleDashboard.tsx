'use client';

import { Clock } from 'lucide-react';

import { ScheduleStats } from '@/interfaces';

import KeyStatsGrid from '@/components/app/mystyc/admin/ui/charts/KeyStatsGrid';
import PieChartWithLegend from '@/components/app/mystyc/admin/ui/charts/PieChartWithLegend';
import SimpleBarChart from '@/components/app/mystyc/admin/ui/charts/SimpleBarChart';

type ChartType = 'stats' | 'events' | 'upcoming' | 'status';

interface ScheduleDashboardProps {
  data?: ScheduleStats | null;
  charts?: ChartType[];
  height?: number;
}

export default function ScheduleDashboard({ 
  data, 
  charts = ['stats', 'events', 'upcoming', 'status'],
  height = 100
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
    const diff = execution.nextExecution.getTime() - now.getTime();
    const hoursUntil = Math.max(0, Math.round(diff / (1000 * 60 * 60)));
    
    return {
      name: execution.eventName.split('.').pop() || execution.eventName, // Get last part
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
    )
  };

  return (
    <div className="@container grow flex flex-col">
      {/* Schedule Health Indicator */}
      <div className="mb-4 flex items-center justify-center">
        <div className={`inline-flex items-center px-4 py-2 rounded-lg ${
          data.summary.enabledSchedules > 0 ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <Clock className={`w-5 h-5 mr-2 ${
            data.summary.enabledSchedules > 0 ? 'text-green-600' : 'text-red-600'
          }`} />
          <div className="text-center">
            <div className={`font-medium text-sm ${
              data.summary.enabledSchedules > 0 ? 'text-green-700' : 'text-red-700'
            }`}>
              {data.summary.enabledSchedules > 0 ? 'Scheduler Active' : 'No Active Schedules'}
            </div>
            <div className="text-xs text-gray-600">
              {data.summary.enabledSchedules > 0 
                ? `${data.summary.enabledSchedules} schedules running`
                : 'All schedules are disabled'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className={`flex-1 flex flex-col @lg:grid grid-cols-${charts.length} gap-4`}>
        {charts.map((chartType) => (
          <div key={chartType} className='flex h-full'>
            {chartComponents[chartType]}
          </div>
        ))}
      </div>

      {/* Next Execution Details */}
      {data.performance.upcomingExecutions.length > 0 && (
        <div className="mt-4 bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1 text-gray-500" />
              <span className="font-medium text-gray-700">Next Execution:</span>
            </div>
            <div className="text-gray-600">
              {data.performance.upcomingExecutions[0].eventName} at {data.performance.upcomingExecutions[0].scheduledTime}
              {data.performance.upcomingExecutions[0].timezoneAware && (
                <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-1 rounded">timezone-aware</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};