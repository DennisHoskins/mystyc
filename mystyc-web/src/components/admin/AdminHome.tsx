'use client';

import { useState, useEffect, useCallback } from 'react';

import { AdminStatsResponseWithQuery } from 'mystyc-common/admin/interfaces/responses';

import { useAdmin } from '@/hooks/admin/useAdmin';
import { logger } from '@/util/logger';

import { useBusy } from '@/components/ui/layout/context/AppContext';
import { AdminStatsResponseExtended } from '@/interfaces/admin/stats';

import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import DashboardIcon from '@/components/admin/ui/icons/DashboardIcon'
import AdminError from '@/components/admin/ui/AdminError';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import SessionsDashboard from './pages/sessions/SessionsDashboard';

// Default query parameters for comprehensive dashboard view
export function getDefaultDashboardStatsQuery() {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - 29); // 30 days total including today

  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];
  
  return {
    startDate: startDateStr,
    endDate: endDateStr,
    maxRecords: 10000
  }
};

export default function AdminHome() {
  const { admin } = useAdmin();
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminStatsResponseWithQuery<AdminStatsResponseExtended> | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const defaultQuery = getDefaultDashboardStatsQuery();
      const stats = await admin.stats.getDashboard(defaultQuery);
      setStats(stats)
    } catch (err) {
      logger.error('Failed to load dashboard:', err);
      setError('Failed to load dashboard. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy, admin.stats]);

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
    <>
      <div className="flex flex-col sm:flex-row mb-4">
        <Card className='grow'>
          <div className='flex space-x-3 items-center mb-4'>
            <div className='mt-1'>
              <Avatar size={'medium'} icon={<DashboardIcon />} />
            </div>
            <Heading level={2}>Admin</Heading>
          </div>
          <hr />
          <Text className='mt-4 flex-1'>Overview of system activity, key metrics, and quick access to administrative tasks</Text>
        </Card>
        <Card className='sm:ml-4 mt-4 sm:mt-0 min-w-44 lg:min-w-64'>
          <SessionsDashboard 
            stats={stats?.data.sessions ? {
              data: stats.data.sessions,
              query: stats.query,
              queryString: stats.queryString,
            } : null}
          />
        </Card>
      </div>
      <AdminDashboard stats={stats} />
    </>
  );
};