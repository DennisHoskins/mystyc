'use client';

import { useState, useEffect, useCallback } from 'react';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { useBusy } from '@/components/layout/context/AppContext';
import { logger } from '@/util/logger';
import { AdminStatsResponse } from '@/interfaces';

import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import DashboardIcon from '@/components/app/mystyc/admin/ui/icons/DashboardIcon'
import AdminDashboard from './content/dashboard/AdminDashboard';
import AdminError from '@/components/app/mystyc/admin/ui/AdminError';
import SessionsDashboard from './content/dashboard/SessionsDashboard';

export default function AdminHome() {
  const { setBusy } = useBusy();
  const { handleSessionError } = useSessionErrorHandler();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdminStatsResponse | null>(null);

  // Default query parameters for comprehensive dashboard view
  const getDefaultDashboardQuery = () => {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 29); // 30 days total including today

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    return {
      traffic: {
        startDate: startDateStr,
        endDate: endDateStr,
        maxRecords: 10000
      },
      users: {
        period: 'daily' as const,
        limit: 10000,
        maxRecords: 10000
      },
      devices: {
        startDate: startDateStr,
        endDate: endDateStr,
        maxRecords: 5000
      },
      authEvents: {
        startDate: startDateStr,
        endDate: endDateStr,
        maxRecords: 50000
      },
      notifications: {
        period: 'daily' as const,
        limit: 10000,
        startDate: startDateStr,
        endDate: endDateStr,
        maxRecords: 50000
      },
      schedules: {
        period: 'daily' as const,
        limit: 10000,
        startDate: startDateStr,
        endDate: endDateStr
      },
      content: {
        period: 'daily' as const,
        limit: 10000,
        startDate: startDateStr,
        endDate: endDateStr
      },
      sessions: {
        startDate: startDateStr,
        endDate: endDateStr
      }
    };
  };

  const loadDashboard = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);
      setLoading(true);

      const defaultQuery = getDefaultDashboardQuery();
      const response = await apiClientAdmin.getDashboard(defaultQuery);

      setData(response)
    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'AdminHome');
      if (!wasSessionError) {
        logger.error('Failed to load dashboard:', err);
      }
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [setBusy, handleSessionError]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return null;
  }

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
          <SessionsDashboard data={data?.sessions} />
        </Card>
      </div>
      <AdminDashboard data={data} />
    </>
  );
};