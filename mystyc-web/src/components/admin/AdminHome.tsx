'use client'

import { useState, useEffect, useCallback } from 'react';

import { AdminStatsQuery } from 'mystyc-common/admin';
import { AdminStatsResponseExtended } from '@/interfaces/admin/stats';
import { getDashboardStats } from '@/server/actions/admin/stats';
import { getDefaultStatsQuery } from '@/util/admin/getQuery';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminCard from './ui/AdminCard';
import DashboardIcon from '@/components/admin/ui/icons/DashboardIcon'
import AdminError from '@/components/admin/ui/AdminError';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import SessionsDashboard from './pages/sessions/SessionsDashboard';
import SessionsHealth from './pages/sessions/SessionsHealth';
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
      <div className='flex-1 flex flex-col p-0 sm:p-1 sm:pb-0 w-full'>
        <div className="flex flex-col sm:flex-row mb-1">
          <AdminCard className='grow'
            icon={<DashboardIcon />}
            title='Admin'
            tag={<SessionsDashboard stats={stats?.sessions} />}
          >
            <AdminError 
              title={"Unable to load dashboard"}
              error={error} 
              onRetry={loadDashboard}
            />
          </AdminCard>
        </div>
      </div>
    );
  }

  return(
    <div className='flex-1 flex flex-col w-full p-0 sm:p-1 sm:pb-0 sm:pr-2'>
      <div className="flex flex-col sm:flex-row mb-1">
        <AdminCard className='grow'
          icon={<DashboardIcon />}
          title='Admin'
          tag={<SessionsDashboard stats={stats?.sessions} />}
        >
          <div className='flex w-full'>
            <ul className='flex space-x-2 flex-1 flex-wrap mr-2'>
              <li>
                <Capsule
                  label={`All Users`}
                  total={stats?.users.profiles.totalUsers}
                  hasTotal={true}
                  href='/admin/users?all'
                  icon={<Users className='w-3 h-3' />}
                />
              </li>
              <li>
                <Capsule
                  label={`Plus Users`}
                  total={stats?.subscriptions.summary.totalSubscriptions}
                  hasTotal={true}
                  href='/admin/users?plus'
                  icon={<UserPlus className='w-3 h-3' />}
                />
              </li>
              <li>
                <Capsule
                  label={`All Devices`}
                  total={stats?.devices.platforms.totalDevices}
                  hasTotal={true}
                  href='/admin/devices?all'
                  icon={<MonitorSmartphone className='w-3 h-3' />}
                />
              </li>
              <li>
                <Capsule
                  label={`Online Devices`}
                  total={stats?.devices.fcmTokens.totalDevices}
                  hasTotal={true}
                  href='/admin/devices?online'
                  icon={<MonitorCheck className='w-3 h-3' />}
                />
              </li>
            </ul>
            <div>
            <SessionsHealth
              stats={stats?.sessions}
            />
          </div>
          </div>
        </AdminCard>
      </div>
      <AdminDashboard query={query} stats={stats} />
    </div>
  );
};