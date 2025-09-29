import { SessionStats } from '@/interfaces/admin/stats';
import Link from '@/components/ui/Link';
import KeyStatsGrid from '../../ui/charts/KeyStatsGrid';

export default function SessionsDashboard({ stats, className } : { stats?: SessionStats | null | undefined, className?: string }) {
  return (
    <Link 
      href="/admin/sessions"
      className={`flex flex-1 space-x-4 ${className}`}
    >
      <KeyStatsGrid 
        stats={[
          { value: stats?.summary.totalSessions || "", label: 'Sessions', color: 'text-blue-600' },
          { value: stats?.summary.totalDevices || "", label: 'Devices', color: 'text-blue-600' },
        ]} 
      />
    </Link>
  );
}