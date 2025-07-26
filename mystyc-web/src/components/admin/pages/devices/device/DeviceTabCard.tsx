'use client';

import { useEffect, useMemo, useState } from 'react';

import { DeviceSummary } from 'mystyc-common/admin';

import { apiClientAdmin } from '@/api/admin/apiClientAdmin';
import { logger } from '@/util/logger';

import Card from '@/components/ui/Card';
import TabPanel, { Tab } from '@/components/ui/TabPanel';
import DeviceUsersTable from './tables/DeviceUsersTable';
import DeviceAuthEventsTable from './tables/DeviceAuthEventsTable';
import DeviceNotificationsTable from './tables/DeviceNotificationsTable';

export default function DeviceTabCard({ deviceId }: { deviceId?: string | null }) {
  const [activeTab, setActiveTab] = useState('users');
  const [summary, setSummary] = useState<DeviceSummary | null>(null);

  // Load summary data (all counts)
  useEffect(() => {
    if (!deviceId) return;

    const loadSummary = async () => {
      try {
        const summaryData = await apiClientAdmin.devices.getDeviceSummary(deviceId);
        setSummary(summaryData);
      } catch (err) {
        logger.error('Failed to load device summary:', err);
      }
    };

    loadSummary();
  }, [deviceId]);

  const tabs: Tab[] = useMemo(() => {
    return [
      {
        id: 'users',
        label: 'Users',
        count: summary?.users,
        content: (
          <DeviceUsersTable
            deviceId={deviceId}
            isActive={activeTab === 'users'}
          />
        )
      },
      {
        id: 'notifications',
        label: 'Notifications',
        count: summary?.notifications,
        content: (
          <DeviceNotificationsTable
            deviceId={deviceId}
            isActive={activeTab === 'notifications'}
          />
        )
      },
      {
        id: 'auth-events',
        label: 'Auth Events',
        count: summary?.authEvents,
        content: (
          <DeviceAuthEventsTable
            deviceId={deviceId}
            isActive={activeTab === 'auth-events'}
          />
        )
      },
    ];
  }, [deviceId, activeTab, summary]);

  return (
    <Card className='flex-1'>
      <TabPanel 
        tabs={tabs} 
        defaultActiveTab={activeTab}
        onTabChange={setActiveTab}
      />
    </Card>      
  );
}