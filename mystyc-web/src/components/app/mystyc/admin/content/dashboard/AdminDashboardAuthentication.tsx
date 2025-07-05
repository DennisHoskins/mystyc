'use client';

import { AuthEventStats } from '@/interfaces';
import { XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Tooltip } from 'recharts';

import Card from '@/components/ui/Card';
import AdminDashboardHeader from './AdminDashboardHeader';
import AuthenticationIcon from '../../ui/icons/AuthenticationIcon'; // Adjust icon import

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

export default function AdminDashboardAuthentication({ data } : { data?: AuthEventStats | null }) {
  if (!data) {
    return null;
  }

  // Transform event types for pie chart
  const eventTypeData = data.summary.eventsByType.map(event => ({
    name: event.type,
    value: event.count,
    percentage: event.percentage
  }));

  // Transform peak hours for bar chart (top 12 hours)
  const peakHoursData = data.pattern.peakHours.slice(0, 12).map(hour => ({
    hour: `${hour.hour}:00`,
    count: hour.count
  }));

  // Transform session duration for bar chart
  const sessionData = data.duration.sessionDurations.map(session => ({
    range: session.range,
    count: session.count,
    percentage: session.percentage
  }));

  return(
    <Card>
      <AdminDashboardHeader
        icon={<AuthenticationIcon />}
        title={'Authentication'}
        link={'/admin/authentication'}
      />

      <hr />
      
      <div className="space-y-6 p-4 mt-2">
        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center bg-gray-50 py-2 rounded-md">
            <div className="text-2xl font-bold text-blue-600">{data.summary.totalEvents}</div>
            <div className="text-sm text-gray-500">Total Events</div>
          </div>
          <div className="text-center bg-gray-50 py-2 rounded-md">
            <div className="text-2xl font-bold text-green-600">{data.pattern.loginFrequency.averageLoginsPerUser}</div>
            <div className="text-sm text-gray-500">Avg Logins/User</div>
          </div>
        </div>

        {/* Event Type Breakdown */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Event Types</h4>
          <div className="flex items-center justify-between bg-gray-50 py-2 rounded-md">
            <ResponsiveContainer width="60%" height={100}>
              <PieChart>
                <Pie
                  data={eventTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={20}
                  outerRadius={40}
                  dataKey="value"
                >
                  {eventTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [`${props.payload.percentage}%`, props.payload.name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-xs space-y-1 mr-4">
              {eventTypeData.map((item, index) => (
                <div key={item.name} className="flex items-center">
                  <div 
                    className="w-2 h-2 rounded-full mr-2" 
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span>{item.name}: {item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Peak Hours */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Peak Hours (Top 12)</h4>
          <ResponsiveContainer width="100%" height={120} className={'bg-gray-50 py-2 rounded-md'}>
            <BarChart data={peakHoursData}>
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
              <YAxis hide />
              <Tooltip formatter={(value) => [value, 'Events']} />
              <Bar dataKey="count" fill="#10b981" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Session Duration */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Session Duration</h4>
          <ResponsiveContainer width="100%" height={100} className={'bg-gray-50 py-2 rounded-md'}>
            <BarChart data={sessionData}>
              <XAxis dataKey="range" tick={{ fontSize: 10 }} />
              <YAxis hide />
              <Tooltip formatter={(value, name, props) => [`${props.payload.percentage}%`, 'Sessions']} />
              <Bar dataKey="count" fill="#f59e0b" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};