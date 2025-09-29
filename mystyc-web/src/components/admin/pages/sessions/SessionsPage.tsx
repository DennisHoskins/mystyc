'use client'

import { useState, useEffect, useCallback } from 'react';

import { SessionStats } from '@/interfaces/admin/stats';
import { getSessions, getSessionStats, getSessionsDevices } from '@/server/actions/admin/sessions';
import { getDefaultStatsQuery } from '@/util/admin/getQuery';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import TabHeader, { Tab } from '@/components/ui/tabs/TabHeader';
import TabPanel, { TabContent } from '@/components/ui/tabs/TabPanel';
import SessionsTable from './SessionsTable';
import SessionDevicesTable from './SessionsDevicesTable';
import SessionIcon from '@/components/admin/ui/icons/SessionIcon';
import SessionsDashboard from './SessionsDashboard';

export default function SessionsPage() {
  const { setBusy } = useBusy();
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('sessions');

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Sessions' },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const loadData = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const statsQuery = getDefaultStatsQuery();
      const stats = await getSessionStats({deviceInfo: getDeviceInfo(), ...statsQuery});

      setStats(stats);
    } catch (err) {
      logger.error('Failed to load session stats:', err);
      setError('Failed to load session stats. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Server action wrapper functions
  const getAllSessions = useCallback((params: any) => {
    return getSessions(params);
  }, []);

  const getAllSessionDevices = useCallback((params: any) => {
    return getSessionsDevices(params);
  }, []);

  const tabs: Tab[] = [
    {
      id: 'sessions',
      label: 'Sessions',
      count: stats?.summary.totalSessions,
      hasCount: true
    },
    {
      id: 'devices',
      label: 'Devices',
      count: stats?.summary.totalDevices,
      hasCount: true
    }
  ];

  const tabContents: TabContent[] = [
    {
      id: 'sessions',
      content: (
        <SessionsTable
          serverAction={getAllSessions}
          onRefresh={loadData}
        />
      )
    },
    {
      id: 'devices',
      content: (
        <SessionDevicesTable
          serverAction={getAllSessionDevices}
          onRefresh={loadData}
        />
      )
    }
  ];

  return (
    <AdminListLayout
      error={error}
      onRetry={loadData}
      breadcrumbs={breadcrumbs}
      icon={SessionIcon}
      headerContent={
        <TabHeader 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      }
      sideContent={
        <SessionsDashboard
          className='-mt-2' 
          stats={stats} 
        />
      }
      mainContent={
        <TabPanel 
          tabs={tabContents}
          activeTab={activeTab}
        />
      }
    />
  );
}