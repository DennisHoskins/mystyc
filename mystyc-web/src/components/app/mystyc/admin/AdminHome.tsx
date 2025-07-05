'use client';

import { useState, useEffect, useCallback } from 'react';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { useBusy } from '@/components/layout/context/AppContext';
import { logger } from '@/util/logger';

import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import DashboardIcon from '@/components/app/mystyc/admin/ui/icons/DashboardIcon'
import AdminDashboard from './content/dashboard/AdminDashboard';
import { AdminStatsResponse } from '@/interfaces';
import AdminDashboardSessions from './content/dashboard/AdminDashboardSessions';

export default function AdminHome() {
  const { setBusy } = useBusy();
  const { handleSessionError } = useSessionErrorHandler();
  const [data, setData] = useState<AdminStatsResponse | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      console.log("[AdminHome] loadDashboard");
      setBusy(true);

      const response = await apiClientAdmin.getDashboard({});
      console.log("[AdminHome] loadDashboard --> response: ", response);

      setData(response)
    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'UsersPage');
      if (!wasSessionError) {
        logger.error('Failed to load users:', err);
      }
    } finally {
      setBusy(false)
    }
  }, [setBusy, handleSessionError]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return(
    <>
      <div className="flex flex-col sm:flex-row mb-4">
        <Card className='grow'>
          <div className='flex space-x-3 items-center mb-4'>
            <div className='mt-1'>
              <Avatar size={'medium'} icon={<DashboardIcon />} />
            </div>
            <Heading level={2}>Admin Dashboard</Heading>
          </div>
          <hr />
            <Text className='mt-4 flex-1'>Overview of system activity, key metrics, and quick access to administrative tasks</Text>
        </Card>

        <Card className='sm:ml-4 mt-4 sm:mt-0 min-w-44 lg:min-w-64'>
          <AdminDashboardSessions data={data?.sessions} />
        </Card>
      </div>
      <AdminDashboard data={data} />
    </>
  );
};