import { HeartPulse } from 'lucide-react'

import { SessionStats } from '@/interfaces/admin/stats';
import Link from '@/components/ui/Link';

export default function SessionsDashboard({ stats } : { stats?: SessionStats | null | undefined }) {

  const healthy = stats?.summary.totalSessions === stats?.summary.totalDevices;
  const difference = stats ? Math.abs(stats.summary.totalSessions - stats.summary.totalDevices) : 0;
  
  // Health status logic
  const getHealthStatus = () => {
    if (healthy) {
      return {
        status: 'Healthy',
        iconColor: 'text-green-500',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        message: 'All sessions are properly tracked'
      };
    } else if (difference <= 2) {
      return {
        status: 'Minor Issues',
        iconColor: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-700',
        message: 'Small session mismatch detected'
      };
    } else {
      return {
        status: 'Unhealthy',
        iconColor: 'text-red-500',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        message: 'Session tracking issues detected'
      };
    }
  };

  const healthStatus = getHealthStatus();

  return(
    <Link 
      href="/admin/sessions"
      className="flex flex-1 items-center space-x-4"
    >
      <div className="flex-1 flex flex-col">
        {/* Health Indicator */}
        <div className={`flex-1 inline-flex items-center justify-center px-3 py-2 rounded-lg ${healthStatus.bgColor}`}>
          <HeartPulse className={`w-6 h-6 mr-2 ${healthStatus.iconColor}`} />
          
          {/* Large screens and small screens: Full layout */}
          <div className="block md:hidden lg:block">
            <div className={`font-medium text-xs ${healthStatus.textColor}`}>
              {healthStatus.status}
            </div>
            <div className="text-xs text-gray-600">
              {healthStatus.message}
            </div>
          </div>
          
          {/* Medium screens only: Compact horizontal layout */}
          <div className="hidden md:block lg:hidden">
            <div className={`font-medium text-xs ${healthStatus.textColor} flex items-center`}>
              {healthStatus.status}
              {!healthy && (
                <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">
                  ({difference})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Session Details */}
        {/* Large screens and small screens: Two column grid */}
        <div className="mt-3 grid-cols-2 gap-3 text-sm grid md:hidden lg:grid">
          <div className="bg-gray-50 px-3 py-1 rounded-md">
            <div className="font-medium text-xs text-gray-700 flex justify-center items-center">
              Sessions:
              <span className="text-sm font-bold text-blue-600 ml-2">{stats?.summary.totalSessions}</span>
            </div>              
          </div>
          <div className="bg-gray-50 px-3 py-1 rounded-md">
            <div className="font-medium text-xs text-gray-700 flex justify-center items-center">
              Devices:
              <span className="ml-4 text-sm font-bold text-green-600">{stats?.summary.totalDevices}</span>
            </div>
          </div>
        </div>

        {/* Medium screens only: Single line format */}
        <div className="mt-3 hidden md:block lg:hidden">
          <div className="bg-gray-50 px-3 py-2 rounded-md text-center">
            <div className="font-medium text-xs text-gray-700">
              Sessions: <span className="text-blue-600 font-bold">{stats?.summary.totalSessions}</span> / <span className="text-green-600 font-bold">{stats?.summary.totalDevices}</span>
            </div>
          </div>
        </div>

        {/* Difference indicator (only for large screens and small screens) */}
        {!healthy && (
          <div className="mt-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded block md:hidden lg:block">
            Difference: {difference} {difference === 1 ? 'session' : 'sessions'}
          </div>
        )}
      </div>
    </Link>
  );
};