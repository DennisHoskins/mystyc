'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

import { TrafficStats } from '@/interfaces/admin/stats';

import { useAdmin } from '@/hooks/admin/useAdmin';
import { logger } from '@/util/logger';
import { getDefaultDashboardStatsQuery } from '../../AdminHome';

import { useBusy } from '@/components/ui/layout/context/AppContext';
import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
import TrafficIcon from '@/components/admin/ui/icons/TrafficIcon';
import TrafficDetailsPanel from './TrafficDetailsPanel';
import TrafficAnalyticsCard from './TrafficAnalyticsCard';
import TrafficSidebarPanel from './TrafficSidebarPanel';
import TrafficMainCard from './TrafficMainCard';

export default function TrafficPage() {
  const { admin } = useAdmin();
  const { setBusy } = useBusy();
  const [trafficStats, setTrafficStats] = useState<TrafficStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadTrafficStats = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const statsQuery = getDefaultDashboardStatsQuery();
      const stats = await admin.traffic.getTrafficStats(statsQuery);
      setTrafficStats(stats.data);
    } catch (err) {
      logger.error('Failed to load traffic stats:', err);
      setError('Failed to load traffic stats. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy, admin.traffic]);

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
      sidebarContent={<TrafficSidebarPanel trafficStats={trafficStats} />}
      sectionsContent={[
        <TrafficAnalyticsCard key='analytics' trafficStats={trafficStats} />
      ]}
      mainContent={<TrafficMainCard trafficStats={trafficStats} />}
    />
  );
}