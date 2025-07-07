'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { TrafficStats } from '@/interfaces';
import { useBusy } from '@/components/layout/context/AppContext';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { logger } from '@/util/logger';

import AdminListLayout from '@/components/app/mystyc/admin/ui/AdminListLayout';
import TrafficIcon from '@/components/app/mystyc/admin/ui/icons/TrafficIcon';
import TrafficDashboard from '../dashboard/TrafficDashboard';

export default function UsersPage() {
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  const [data, setData] = useState<TrafficStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Website Traffic' },
  ];

  const loadData = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const data = await apiClientAdmin.getTrafficStats({});
      setData(data);
    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'UsersPage');
      if (!wasSessionError) {
        logger.error('Failed to load traffic:', err);
        setError('Failed to load traffic. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  }, [setBusy, handleSessionError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
   <AdminListLayout
      breadcrumbs={breadcrumbs}
      icon={TrafficIcon}
      description="Need a description"
      sideContent={
        <TrafficDashboard 
          data={data} 
          charts={['stats']}
        />
      }
    />
  );
}