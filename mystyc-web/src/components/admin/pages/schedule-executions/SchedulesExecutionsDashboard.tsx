import { CalendarClock } from 'lucide-react';

import { ScheduleExecutionStats } from 'mystyc-common/admin/interfaces/stats';
import { AdminStatsQuery } from 'mystyc-common/admin';
import StatusCard from '@/components/admin/ui/charts/StatusCard';
import KeyStatsGrid from '@/components/admin/ui/charts/KeyStatsGrid';
import PieChartWithLegend from '@/components/admin/ui/charts/PieChartWithLegend';
import SimpleBarChart from '@/components/admin/ui/charts/SimpleBarChart';
import SimpleLineChart from '@/components/admin/ui/charts/SimpleLineChart';

type ChartType = 'stats' | 'events' | 'performance' | 'recent' | 'today';

interface SchedulesExecutionsDashboardProps {
  query?: Partial<AdminStatsQuery> | null;
  stats?: ScheduleExecutionStats | null;
  charts?: ChartType[];
  height?: number;
}

export default function SchedulesExecutionsDashboard({ 
  query,
  stats, 
  charts = ['stats', 'events', 'performance', 'recent', 'today'],
  height
}: SchedulesExecutionsDashboardProps) {
  // Transform event type breakdown for pie chart
  const eventData = stats?.byEventType.map(event => ({
    name: event.eventName.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim() || event.eventName,
    value: event.executions,
    percentage: Math.round((event.executions / stats?.systemOverview.totalExecutions) * 100)
  }));

  // Transform event type performance for bar chart
  const performanceData = stats?.byEventType.map(event => ({
    name: event.eventName.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim() || event.eventName,
    successRate: event.successRate,
    executions: event.executions
  }));

  // Transform recent executions for timeline (last 10, reversed to show chronological order)
  const recentData = stats?.recentExecutions.slice(-10).reverse().map((execution, index) => ({
    date: new Date(execution.executedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    success: execution.status === 'completed' ? 1 : 0,
    index: index
  }));

  // Calculate "today" or last day data
  const endDate = query?.endDate ? new Date(query.endDate) : new Date();
  const today = new Date();
  const isToday = endDate.toDateString() === today.toDateString();
  
  // Filter executions for the target date
  const targetDayExecutions = stats?.recentExecutions.filter(execution => {
    const execDate = new Date(execution.executedAt);
    return execDate.toDateString() === endDate.toDateString();
  });
  
  const dayLabel = isToday ? "Today" : endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const dayCount = targetDayExecutions?.length || 0;
  const daySuccessful = targetDayExecutions?.filter(e => e.status === 'completed').length;

  const chartComponents = {
    stats: (
      <KeyStatsGrid 
        stats={[
          { value: stats ? stats.systemOverview.totalExecutions : "", label: 'Executions', color: 'text-blue-600' },
          { value: stats ? `${stats.systemOverview.successRate}%` : "", label: 'Success', color: 'text-green-600' }
        ]} 
      />
    ),
    today: (
      <StatusCard
        icon={CalendarClock}
        iconColor="text-gray-500"
        text={`${dayLabel}:`}
        subtext={`${dayCount} executed`}
        vertical={true}
        badge={dayCount > 0 && (
          <span className={`text-xs ml-2 flex items-center ${
            daySuccessful === dayCount 
              ? 'text-green-700' 
              : 'text-yellow-700'
          }`}>
            <span>
              {daySuccessful === dayCount ? 'all ✓' : `${daySuccessful}/${dayCount} ✓`}
            </span>
          </span>
        )}
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
    performance: (
      <SimpleBarChart 
        title="Success Rate by Event"
        data={performanceData}
        height={height}
        dataKey="successRate"
        xAxisKey="name"
        color="#10b981"
        tooltipLabel="Success Rate %"
        fontSize={10}
      />
    ),
    recent: (
      <SimpleLineChart 
        title="Recent Execution Trend"
        data={recentData}
        height={height}
        dataKey="success"
        xAxisKey="date"
        color="#3b82f6"
        tooltipLabel="Successful Executions"
        showXAxisTicks={false}
        strokeWidth={2}
        showDots={true}
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