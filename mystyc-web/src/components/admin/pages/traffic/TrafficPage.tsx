'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';

import { TrafficStats } from '@/interfaces/admin/stats';
import { getDefaultStatsQuery } from '@/util/admin/getQuery';
import { getTrafficStats } from '@/server/actions/admin/stats';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import TrafficIcon from '@/components/admin/ui/icons/TrafficIcon';
import TrafficAnalyticsPanel from './TrafficAnalyticsPanel';
import TrafficDashboard from './TrafficDashboard';
import TrafficMainPanel from './TrafficMainPanel';

export default function TrafficPage() {
  const { setBusy } = useBusy();
  const [trafficStats, setTrafficStats] = useState<TrafficStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadTrafficStats = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const statsQuery = getDefaultStatsQuery();
      const stats = await getTrafficStats({deviceInfo: getDeviceInfo(), ...statsQuery});
      setTrafficStats(stats);
    } catch (err) {
      logger.error('Failed to load traffic stats:', err);
      setError('Failed to load traffic stats. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    loadTrafficStats();
  }, [loadTrafficStats]);

  const breadcrumbs = useMemo(() => [
    { label: 'Admin', href: '/admin' },
    { label: 'Website Traffic' },
  ], []);

  return (
    <AdminListLayout
      error={error}
      onRetry={loadTrafficStats}
      breadcrumbs={breadcrumbs}
      icon={<TrafficIcon size={6} />}
      title="Website Traffic Analytics"
      sideContent={
        <TrafficDashboard 
          data={trafficStats} 
          charts={['stats']}
        />
      }
      headerContent={<TrafficAnalyticsPanel key='analytics' trafficStats={trafficStats} />}
      mainContent={<TrafficMainPanel trafficStats={trafficStats} />}
    />
  );
}