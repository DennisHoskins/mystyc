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
import Capsule from '../ui/Capsule';
import { MonitorCheck, MonitorSmartphone, UserPlus, Users } from 'lucide-react';

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
        <Card className='mb-4 space-y-4'>
          <div className='flex space-x-3 items-center'>
            <Avatar size={'medium'} icon={<DashboardIcon />} />
            <Heading level={2}>Admin</Heading>
          </div>
          <hr />
          <Text className='flex-1'>Overview of system activity, key metrics, and quick access to administrative tasks</Text>
          <AdminError 
            title={"Unable to load dashboard"}
            error={error} 
            onRetry={loadDashboard}
          />
        </Card>
      </>
    );
  }

  return(
    <div className='flex-1 flex flex-col p-4 pb-0 w-full'>
      <div className="flex flex-col sm:flex-row mb-4">
        <Card className='grow space-y-2'>
          <div className='flex space-x-3 items-center'>
            <Avatar size={'small'} icon={<DashboardIcon />} />
            <Heading level={3}>Admin</Heading>
          </div>
          <hr />
          <Text className='mb-2 flex-1'>Overview of system activity, key metrics, and quick access to administrative tasks</Text>
          <ul className='flex space-x-2'>
            <li>
              <Capsule
                label={`All Users ${stats?.users.profiles.totalUsers}`}
                href='/admin/users?all'
                icon={<Users className='w-3 h-3' />}
              />
            </li>
            <li>
              <Capsule
                label={`Plus Users ${stats?.subscriptions.summary.totalSubscriptions}`}
                href='/admin/users?plus'
                icon={<UserPlus className='w-3 h-3' />}
              />
            </li>
            <li>
              <Capsule
                label={`All Devices ${stats?.devices.platforms.totalDevices}`}
                href='/admin/devices?all'
                icon={<MonitorSmartphone className='w-3 h-3' />}
              />
            </li>
            <li>
              <Capsule
                label={`Online Devices ${stats?.devices.fcmTokens.totalDevices}`}
                href='/admin/devices?online'
                icon={<MonitorCheck className='w-3 h-3' />}
              />
            </li>
          </ul>
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