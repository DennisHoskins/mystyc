'use client'

import { useState, useEffect, useCallback } from 'react';

import { AdminStatsQuery } from 'mystyc-common/admin';
import { AdminStatsResponseExtended } from '@/interfaces/admin/stats';
import { getDashboardStats } from '@/server/actions/admin/stats';
import { getDefaultStatsQuery } from '@/util/admin/getQuery';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import DashboardIcon from '@/components/admin/ui/icons/DashboardIcon'
import AdminError from '@/components/admin/ui/AdminError';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import SessionsDashboard from './pages/sessions/SessionsDashboard';

export default function AdminHome() {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<Partial<AdminStatsQuery> | null>(null);
  const [stats, setStats] = useState<AdminStatsResponseExtended | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const defaultQuery = getDefaultStatsQuery();
      const stats = await getDashboardStats({deviceInfo: getDeviceInfo(), ...defaultQuery});

      setQuery(defaultQuery)
      setStats(stats)
    } catch (err) {
      logger.error('Failed to load dashboard:', err);
      setError('Failed to load dashboard. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (error) {
    return(
      <>
        <Card className='mb-4'>
          <div className='flex space-x-3 items-center mb-4'>
            <div className='mt-1'>
              <Avatar size={'medium'} icon={<DashboardIcon />} />
            </div>
            <Heading level={2}>Admin</Heading>
          </div>
          <hr />
          <Text className='mt-4 flex-1'>Overview of system activity, key metrics, and quick access to administrative tasks</Text>
        </Card>
        <AdminError 
          title={"Unable to load dashboard"}
          error={error} 
          onRetry={loadDashboard}
        />
      </>
    );
  }

  return(
    <div className='flex-1 flex flex-col p-4 w-full'>
      <div className="flex flex-col sm:flex-row mb-4">
        <Card className='grow'>
          <div className='flex space-x-3 items-center mb-4'>
            <div className='mt-1'>
              <Avatar size={'small'} icon={<DashboardIcon />} />
            </div>
            <Heading level={3}>Admin</Heading>
          </div>
          <hr />
          <Text className='mt-4 mb-2 flex-1'>Overview of system activity, key metrics, and quick access to administrative tasks</Text>
        </Card>
        <Card className='sm:ml-4 mt-4 sm:mt-0 min-w-44 lg:min-w-64'>
          <SessionsDashboard 
            stats={stats?.sessions}
          />
        </Card>
      </div>
      <AdminDashboard query={query} stats={stats} />
    </div>
  );
};