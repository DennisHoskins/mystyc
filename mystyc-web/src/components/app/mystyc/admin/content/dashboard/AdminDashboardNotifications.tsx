'use client';

import { NotificationStats } from '@/interfaces';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Tooltip } from 'recharts';

import Card from '@/components/ui/Card';
import AdminDashboardHeader from './AdminDashboardHeader';
import NotificationIcon from '../../ui/icons/NotificationIcon';

export default function AdminDashboardNotifications({ data } : { data?: NotificationStats | null }) {
  if (!data) {
    return null;
  }

  // Transform delivery status for pie chart
  const deliveryData = [
    { name: 'Sent', value: data.delivery.deliveryMetrics.sent, color: '#10b981' },
    { name: 'Failed', value: data.delivery.deliveryMetrics.failed, color: '#ef4444' },
    { name: 'Pending', value: data.delivery.deliveryMetrics.pending, color: '#f59e0b' }
  ];

  // Transform platform engagement for bar chart
  const platformData = data.engagement.deliveryByPlatform.map(platform => ({
    name: platform.platform,
    successRate: platform.successRate,
    sent: platform.sent
  }));

  // Transform recent volume trends (last 10 days)
  const volumeData = data.pattern.volumeTrends.slice(-10);

  return(
    <Card>
      <AdminDashboardHeader
        icon={<NotificationIcon />}
        title={'Notifications'}
        link={'/admin/notifications'}
      />

      <hr />
      
      <div className="space-y-6 p-4 mt-2">
        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center bg-gray-50 py-2 rounded-md">
            <div className="text-2xl font-bold text-blue-600">{data.delivery.totalNotifications}</div>
            <div className="text-sm text-gray-500">Total Sent</div>
          </div>
          <div className="text-center bg-gray-50 py-2 rounded-md">
            <div className="text-2xl font-bold text-green-600">{data.delivery.deliveryMetrics.successRate}%</div>
            <div className="text-sm text-gray-500">Success Rate</div>
          </div>
        </div>

        {/* Delivery Status */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Delivery Status</h4>
          <div className="flex items-center justify-between bg-gray-50 py-2 rounded-md">
            <ResponsiveContainer width="60%" height={100}>
              <PieChart>
                <Pie
                  data={deliveryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={20}
                  outerRadius={40}
                  dataKey="value"
                >
                  {deliveryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Notifications']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-xs space-y-1 mr-4">
              {deliveryData.map((item) => (
                <div key={item.name} className="flex items-center">
                  <div 
                    className="w-2 h-2 rounded-full mr-2" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Platform Performance */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Platform Success Rate</h4>
          <ResponsiveContainer width="100%" height={100} className={'bg-gray-50 py-2 rounded-md'}>
            <BarChart data={platformData}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis hide />
              <Tooltip formatter={(value) => [`${value}%`, 'Success Rate']} />
              <Bar dataKey="successRate" fill="#06b6d4" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Volume Trend */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Volume Trend (Last 10 Days)</h4>
          <ResponsiveContainer width="100%" height={100} className={'bg-gray-50 py-2 rounded-md'}>
            <LineChart data={volumeData}>
              <XAxis 
                dataKey="date" 
                tick={false}
                axisLine={false}
              />
              <YAxis hide />
              <Tooltip 
                labelFormatter={(value) => `Date: ${value}`}
                formatter={(value) => [value, 'Notifications']}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};