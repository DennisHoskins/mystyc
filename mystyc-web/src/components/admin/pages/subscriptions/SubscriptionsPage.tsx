'use client';

import { useState, useEffect, useCallback } from 'react';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { SubscriptionStats } from '@/interfaces';
import { useBusy } from '@/components/ui/layout/context/AppContext';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { logger } from '@/util/logger';

import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import SubscriptionsIcon from '@/components/admin/ui/icons/SubscriptionsIcon';
import SubscriptionsTabPanel from './SubscriptionsTabPanel';
import SubscriptionsDashboard from './SubscriptionsDashboard';

export default function SubscriptionsPage() {
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Subscriptions' },
  ];

  const loadStats = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);
      setLoading(true);

      const stats = await apiClientAdmin.getSubscriptionStats();
      setStats(stats);
    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'UsersPage');
      if (!wasSessionError) {
        logger.error('Failed to load subscription stats:', err);
        setError('Failed to load subscription stats. Please try again.');
      }
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [setBusy, handleSessionError]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) {
    return null;
  }

  return (
   <AdminListLayout
      error={error}
      onRetry={loadStats}
      breadcrumbs={breadcrumbs}
      icon={SubscriptionsIcon}
      description="Manage user subscriptions"
      sideContent={
        <SubscriptionsDashboard 
          stats={stats} 
          charts={['stats']}
        />
      }
      tableContent={<SubscriptionsTabPanel />}
    />   
  );
}