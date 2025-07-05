'use client';

import { UserStats } from '@/interfaces';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Tooltip } from 'recharts';

import Card from '@/components/ui/Card';
import AdminDashboardHeader from './AdminDashboardHeader';
import UsersIcon from '../../ui/icons/UsersIcon';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

export default function AdminDashboardUsers({ data } : { data?: UserStats | null }) {
  if (!data) {
    return null;
  }

  // Transform profile completion data for pie chart
  const profileData = [
    { name: 'Full Name', value: data.profiles.completionPercentageRates.fullName },
    { name: 'Date of Birth', value: data.profiles.completionPercentageRates.dateOfBirth },
    { name: 'Zodiac Sign', value: data.profiles.completionPercentageRates.zodiacSign },
  ];

  // Transform activity data for bar chart
  const activityData = [
    { period: '24h', users: data.activity.activeUsers.last24Hours },
    { period: '7d', users: data.activity.activeUsers.last7Days },
    { period: '30d', users: data.activity.activeUsers.last30Days },
  ];

  return(
    <Card>
      <AdminDashboardHeader
        icon={<UsersIcon />}
        title={'Users'}
        link={'/admin/users'}
      />

      <hr />
      
      <div className="space-y-6 p-4 mt-2">
        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center bg-gray-50 py-2 rounded-md">
            <div className="text-2xl font-bold text-blue-600">{data.profiles.totalUsers}</div>
            <div className="text-sm text-gray-500">Total Users</div>
          </div>
          <div className="text-center bg-gray-50 py-2 rounded-md">
            <div className="text-2xl font-bold text-green-600">{data.profiles.completionPercentageRates.totalComplete}%</div>
            <div className="text-sm text-gray-500">Complete Profiles</div>
          </div>
        </div>

        {/* Profile Completion */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Profile Completion</h4>
          <div className="flex items-center justify-between bg-gray-50 py-2 rounded-md">
            <ResponsiveContainer width="60%" height={100}>
              <PieChart>
                <Pie
                  data={profileData}
                  cx="50%"
                  cy="50%"
                  innerRadius={20}
                  outerRadius={40}
                  dataKey="value"
                >
                  {profileData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Completion']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-xs space-y-1 pr-4">
              {profileData.map((item, index) => (
                <div key={item.name} className="flex items-center">
                  <div 
                    className="w-2 h-2 rounded-full mr-2" 
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span>{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Registration Trend */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Registration Trend (30 days)</h4>
          <ResponsiveContainer width="100%" height={120} className={'bg-gray-50 py-2 rounded-md'}>
            <LineChart data={data.registrations.data}>
              <XAxis 
                dataKey="date" 
                tick={false}
                axisLine={false}
              />
              <YAxis hide />
              <Tooltip 
                labelFormatter={(value) => `Date: ${value}`}
                formatter={(value) => [value, 'Registrations']}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Levels */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Active Users</h4>
          <ResponsiveContainer width="100%" height={100} className={'bg-gray-50 py-2 rounded-md'}>
            <BarChart data={activityData}>
              <XAxis dataKey="period" tick={{ fontSize: 12 }} />
              <YAxis hide />
              <Tooltip formatter={(value) => [value, 'Active Users']} />
              <Bar dataKey="users" fill="#10b981" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};