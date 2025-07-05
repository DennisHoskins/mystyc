'use client';

import { DeviceStats } from '@/interfaces';
import { XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Tooltip } from 'recharts';

import Card from '@/components/ui/Card';
import AdminDashboardHeader from './AdminDashboardHeader';
import DevicesIcon from '../../ui/icons/DevicesIcon'; // Adjust icon import

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

export default function AdminDashboardDevices({ data } : { data?: DeviceStats | null }) {
  if (!data) {
    return null;
  }

  // Transform platform data for pie chart
  const platformData = data.platforms.platforms.map(platform => ({
    name: platform.platform,
    value: platform.count,
    percentage: platform.percentage
  }));

  // Transform browser data for bar chart
  const browserData = data.userAgents.browsers.slice(0, 4).map(browser => ({
    name: browser.browser,
    count: browser.count
  }));

  // Transform activity data for bar chart
  const activityData = [
    { period: '24h', devices: data.activity.activeDevices.last24Hours },
    { period: '7d', devices: data.activity.activeDevices.last7Days },
    { period: '30d', devices: data.activity.activeDevices.last30Days },
  ];

  return(
    <Card>
      <AdminDashboardHeader
        icon={<DevicesIcon />}
        title={'Devices'}
        link={'/admin/devices'}
      />

      <hr />
      
      <div className="space-y-6 p-4 mt-2">
        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center bg-gray-50 py-2 rounded-md">
            <div className="text-2xl font-bold text-blue-600">{data.platforms.totalDevices}</div>
            <div className="text-sm text-gray-500">Total Devices</div>
          </div>
          <div className="text-center bg-gray-50 py-2 rounded-md">
            <div className="text-2xl font-bold text-green-600">{data.fcmTokens.fcmTokenCoverage}%</div>
            <div className="text-sm text-gray-500">Push Enabled</div>
          </div>
        </div>

        {/* Platform Distribution */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Platform Distribution</h4>
          <div className="flex items-center justify-between bg-gray-50 py-2 rounded-md">
            <ResponsiveContainer width="60%" height={100}>
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  innerRadius={20}
                  outerRadius={40}
                  dataKey="value"
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [`${props.payload.percentage}%`, props.payload.name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-xs space-y-1 mr-4">
              {platformData.map((item, index) => (
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

        {/* Browser Usage */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Top Browsers</h4>
          <ResponsiveContainer width="100%" height={120} className={'bg-gray-50 py-2 rounded-md'}>
            <BarChart data={browserData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis hide />
              <Tooltip formatter={(value) => [value, 'Devices']} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Device Activity */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Active Devices</h4>
          <ResponsiveContainer width="100%" height={100} className={'bg-gray-50 py-2 rounded-md'}>
            <BarChart data={activityData}>
              <XAxis dataKey="period" tick={{ fontSize: 12 }} />
              <YAxis hide />
              <Tooltip formatter={(value) => [value, 'Active Devices']} />
              <Bar dataKey="devices" fill="#ef4444" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};