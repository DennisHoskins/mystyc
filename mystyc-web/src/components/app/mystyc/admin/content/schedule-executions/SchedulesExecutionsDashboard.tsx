'use client';

import { CalendarClock } from 'lucide-react';

import { StatsResponseWithQuery } from '@/api/apiClientAdmin';
import { ScheduleExecutionStats } from '@/interfaces/admin/stats/adminScheduleExecutionStats.interface';

import KeyStatsGrid from '@/components/app/mystyc/admin/ui/charts/KeyStatsGrid';
import PieChartWithLegend from '@/components/app/mystyc/admin/ui/charts/PieChartWithLegend';
import SimpleBarChart from '@/components/app/mystyc/admin/ui/charts/SimpleBarChart';
import SimpleLineChart from '@/components/app/mystyc/admin/ui/charts/SimpleLineChart';

type ChartType = 'stats' | 'events' | 'performance' | 'recent' | 'today';

interface SchedulesExecutionsDashboardProps {
  stats?: StatsResponseWithQuery<ScheduleExecutionStats> | null;
  charts?: ChartType[];
  height?: number;
}

export default function SchedulesExecutionsDashboard({ 
  stats, 
  charts = ['stats', 'events', 'performance', 'recent', 'today'],
  height = 100
}: SchedulesExecutionsDashboardProps) {
  if (!stats || !stats.data || !stats.data.byEventType || !stats.data.systemOverview) {
    return null;
  }

  // Transform event type breakdown for pie chart
  const eventData = stats.data.byEventType.map(event => ({
    name: event.eventName.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim() || event.eventName,
    value: event.executions,
    percentage: Math.round((event.executions / stats.data.systemOverview.totalExecutions) * 100)
  }));

  // Transform event type performance for bar chart
  const performanceData = stats.data.byEventType.map(event => ({
    name: event.eventName.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim() || event.eventName,
    successRate: event.successRate,
    executions: event.executions
  }));

  // Transform recent executions for timeline (last 10, reversed to show chronological order)
  const recentData = stats.data.recentExecutions.slice(-10).reverse().map((execution, index) => ({
    date: new Date(execution.executedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    success: execution.status === 'completed' ? 1 : 0,
    index: index
  }));

  // Calculate "today" or last day data
  const endDate = stats.query?.endDate ? new Date(stats.query.endDate) : new Date();
  const today = new Date();
  const isToday = endDate.toDateString() === today.toDateString();
  
  // Filter executions for the target date
  const targetDayExecutions = stats.data.recentExecutions.filter(execution => {
    const execDate = new Date(execution.executedAt);
    return execDate.toDateString() === endDate.toDateString();
  });
  
  const dayLabel = isToday ? "Today" : endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const dayCount = targetDayExecutions.length;
  const daySuccessful = targetDayExecutions.filter(e => e.status === 'completed').length;

  const chartComponents = {
    stats: (
      <KeyStatsGrid 
        stats={[
          { value: stats.data.systemOverview.totalExecutions, label: 'Total Executions', color: 'text-blue-600' },
          { value: `${stats.data.systemOverview.successRate}%`, label: 'Success Rate', color: 'text-green-600' }
        ]} 
      />
    ),
    today: (
      <div className="@container flex-1 h-full grow flex flex-col">
        <div className="inline-flex items-center w-full h-full p-4 rounded-lg bg-gray-50 justify-center md:justify-start">
          <CalendarClock className="w-6 h-6 mr-4 text-gray-500" />
          <div>
            <div className="overflow-hidden font-medium text-sm">
              <span className='@[200px]:hidden'>
                {dayLabel}:
              </span>
              <span className='hidden @[200px]:inline'>
                {dayLabel} Executions:
              </span>
            </div>
            <div className="text-xs text-gray-600 leading-relaxed">
              <span className='@[200px]:hidden'>
                {dayCount} executed
                {dayCount > 0 && (
                  <span className={`ml-2 text-xs px-1 rounded ${daySuccessful === dayCount ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {daySuccessful === dayCount ? 'all ✓' : `${daySuccessful}/${dayCount} ✓`}
                  </span>
                )}
              </span>
              <span className='hidden @[200px]:inline'>
                {dayCount === 0 ? 'No executions' : `${dayCount} total`}
                {dayCount > 0 && (
                  <>
                    <br />
                    <span className={`text-xs px-1 rounded ${daySuccessful === dayCount ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {daySuccessful === dayCount ? 'All successful' : `${daySuccessful} successful, ${dayCount - daySuccessful} failed`}
                    </span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
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