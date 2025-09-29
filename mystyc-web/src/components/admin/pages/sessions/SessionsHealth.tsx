import { HeartPulse } from 'lucide-react'

import { SessionStats } from '@/interfaces/admin/stats';
import Link from '@/components/ui/Link';

export default function SessionsHealth({ stats, className } : { stats?: SessionStats | null | undefined, className?: string }) {

  const healthy = stats?.summary.totalSessions === stats?.summary.totalDevices;
  const difference = stats ? Math.abs(stats.summary.totalSessions - stats.summary.totalDevices) : 0;
  
  // Health status logic
  const getHealthStatus = () => {
    if (healthy) {
      return {
        status: 'Healthy',
        iconColor: 'text-green-800',
        bgColor: 'bg-green-500',
        textColor: 'text-green-800',
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

  return (
    <Link 
      href="/admin/sessions"
      className={`flex flex-1 space-x-4 ${className}`}
    >
      <div className={`flex ${healthStatus.bgColor} ${healthStatus.iconColor} rounded-sm px-3 py-1 space-x-1 items-center`}>
        <HeartPulse className={`w-3 h-3`} />
        <p className='text-[10px] font-bold'>{healthStatus.status}</p>
      </div>
    </Link>
  );
}