'use client';

import { useEffect, useMemo, useState } from 'react';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { logger } from '@/util/logger';

import Card from '@/components/ui/Card';
import TabPanel, { Tab } from '@/components/ui/TabPanel';
import DeviceAuthEventsTable from './DeviceAuthEventsTable';
import DeviceNotificationsTable from './DeviceNotificationsTable';

interface DeviceSummary {
  authEvents: { total: number };
  notifications: { total: number };
}

export default function DeviceTabPanel({ deviceId }: { deviceId: string }) {
  const [activeTab, setActiveTab] = useState('auth-events');
  const [summary, setSummary] = useState<DeviceSummary | null>(null);

  // Load summary data (all counts)
  useEffect(() => {
    if (!deviceId) return;

    const loadSummary = async () => {
      try {
        const summaryData = await apiClientAdmin.getDeviceSummary(deviceId);
        setSummary(summaryData);
      } catch (err) {
        logger.error('Failed to load device summary:', err);
      }
    };

    loadSummary();
  }, [deviceId]);

  const tabs: Tab[] = useMemo(() => {
    if (!deviceId) return [];

    return [
      {
        id: 'auth-events',
        label: 'Auth Events',
        count: summary?.authEvents.total,
        content: (
          <DeviceAuthEventsTable
            deviceId={deviceId}
            isActive={activeTab === 'auth-events'}
          />
        )
      },
      {
        id: 'notifications',
        label: 'Notifications',
        count: summary?.notifications.total,
        content: (
          <DeviceNotificationsTable
            deviceId={deviceId}
            isActive={activeTab === 'notifications'}
          />
        )
      }
    ];
  }, [deviceId, activeTab, summary]);

  return (
    <Card className='h-[56rem]'>
      <TabPanel 
        tabs={tabs} 
        defaultActiveTab="auth-events"
        onTabChange={setActiveTab}
      />
    </Card>      
  );
}