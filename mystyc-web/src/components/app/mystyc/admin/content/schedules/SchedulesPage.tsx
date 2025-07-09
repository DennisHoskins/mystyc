'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

import ScheduleDashboard from '@/components/app/mystyc/admin/content/dashboard/ScheduleDashboard';
import { ScheduleStats } from '@/interfaces';

export default function SchedulesPage() {
  const [scheduleStats, setScheduleStats] = useState<ScheduleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for testing - replace with actual API call
  useEffect(() => {
    const fetchScheduleStats = async () => {
      try {
        setLoading(true);
        
        // TODO: Replace with actual API call
        // const response = await fetch('/api/admin/stats/schedules');
        // const data = await response.json();
        
        // Mock data for now
        const mockData: ScheduleStats = {
          summary: {
            totalSchedules: 2,
            enabledSchedules: 2,
            disabledSchedules: 0,
            timezoneAwareSchedules: 2,
            globalSchedules: 0,
            schedulesByEventName: [
              {
                eventName: 'content.generate.content',
                count: 1,
                enabled: 1,
                disabled: 0
              },
              {
                eventName: 'notifications.send.notification',
                count: 1,
                enabled: 1,
                disabled: 0
              }
            ]
          },
          performance: {
            totalSchedules: 2,
            executionStats: [
              {
                eventName: 'content.generate.content',
                timezoneAware: true,
                scheduledTime: '08:30',
                enabled: true,
                lastUpdated: new Date()
              },
              {
                eventName: 'notifications.send.notification',
                timezoneAware: true,
                scheduledTime: '09:00',
                enabled: true,
                lastUpdated: new Date()
              }
            ],
            upcomingExecutions: [
              {
                eventName: 'content.generate.content',
                scheduledTime: '08:30',
                nextExecution: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
                timezoneAware: true
              },
              {
                eventName: 'notifications.send.notification',
                scheduledTime: '09:00',
                nextExecution: new Date(Date.now() + 2.5 * 60 * 60 * 1000), // 2.5 hours from now
                timezoneAware: true
              }
            ]
          },
          failures: {
            totalSchedules: 2,
            monitoringNote: 'Schedule execution failures are currently logged but not tracked in database.'
          }
        };
        
        setScheduleStats(mockData);
      } catch (err) {
        setError('Failed to load schedule statistics');
        console.error('Error fetching schedule stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchScheduleStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading schedule data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Clock className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Schedules</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <Clock className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Schedules</h1>
            <p className="text-gray-600 mt-1">Monitor and manage automated event scheduling</p>
          </div>
        </div>
      </div>

      {/* Schedule Dashboard */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <ScheduleDashboard 
          data={scheduleStats}
          charts={['stats', 'events', 'upcoming', 'status']}
          height={200}
        />
      </div>

      {/* Schedule Details */}
      {scheduleStats && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Schedules */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Schedules</h3>
            <div className="space-y-3">
              {scheduleStats.performance.executionStats
                .filter((schedule: any) => schedule.enabled)
                .map((schedule: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        {schedule.eventName.replace(/\./g, ' ').replace(/^[a-z]/, (match: string) => match.toUpperCase())}
                      </div>
                      <div className="text-sm text-gray-600">
                        Runs at {schedule.scheduledTime}
                        {schedule.timezoneAware && (
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            timezone-aware
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600 font-medium">Active</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Upcoming Executions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Executions</h3>
            <div className="space-y-3">
              {scheduleStats.performance.upcomingExecutions.slice(0, 5).map((execution: any, index: number) => {
                const now = new Date();
                const diff = execution.nextExecution.getTime() - now.getTime();
                const hoursUntil = Math.max(0, Math.round(diff / (1000 * 60 * 60)));
                const minutesUntil = Math.max(0, Math.round((diff % (1000 * 60 * 60)) / (1000 * 60)));
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        {execution.eventName.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="text-sm text-gray-600">
                        Scheduled for {execution.scheduledTime}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-blue-600">
                        {hoursUntil > 0 ? `${hoursUntil}h ` : ''}{minutesUntil}m
                      </div>
                      <div className="text-xs text-gray-500">until execution</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* System Status */}
      {scheduleStats && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Scheduler Status</h4>
              <p className="text-blue-700 text-sm mt-1">
                {scheduleStats.failures.monitoringNote}
              </p>
              <div className="mt-2 text-sm text-blue-600">
                System is monitoring {scheduleStats.summary.enabledSchedules} active schedule(s) 
                and will execute events every 30 minutes as configured.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}