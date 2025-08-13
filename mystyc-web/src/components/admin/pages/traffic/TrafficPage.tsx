'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';

import { TrafficStats } from '@/interfaces/admin/stats';
import { getDefaultStatsQuery } from '@/util/admin/getQuery';
import { getTrafficStats } from '@/server/actions/admin/stats';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
import TrafficIcon from '@/components/admin/ui/icons/TrafficIcon';
import TrafficDetailsPanel from './TrafficDetailsPanel';
import TrafficAnalyticsCard from './TrafficAnalyticsCard';
import TrafficSidebarPanel from './TrafficSidebarPanel';
import TrafficMainCard from './TrafficMainCard';

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
    <AdminItemLayout
      error={error}
      onRetry={loadTrafficStats}
      breadcrumbs={breadcrumbs}
      icon={<TrafficIcon size={6} />}
      title="Website Traffic Analytics"
      headerContent={<TrafficDetailsPanel trafficStats={trafficStats} />}
      sideContent={<TrafficSidebarPanel trafficStats={trafficStats} />}
      itemsContent={[<TrafficAnalyticsCard key='analytics' trafficStats={trafficStats} />]}
      mainContent={<TrafficMainCard trafficStats={trafficStats} />}
    />
  );
}