'use client'

import { useEffect, useMemo, useState } from 'react';

import { UserSummary } from 'mystyc-common/admin';
import { getUserSummary } from '@/server/actions/admin/users';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import Card from '@/components/ui/Card';
import TabPanel, { Tab } from '@/components/ui/TabPanel';
import UserContentTable from './tables/UserContentTable';
import UserDevicesTable from './tables/UserDevicesTable';
import UserAuthEventsTable from './tables/UserAuthEventsTable';
import UserNotificationsTable from './tables/UserNotificationsTable';
import UserPaymentsTable from './tables/UserPaymentsTable';

export default function UserTabCard({ firebaseUid }: { firebaseUid: string | null }) {
  const [activeTab, setActiveTab] = useState('content');
  const [summary, setSummary] = useState<UserSummary | null>(null);

  useEffect(() => {
    const loadSummary = async () => {
      if (!firebaseUid) {
        return;
      }

      try {
        const summaryData = await getUserSummary({deviceInfo: getDeviceInfo(), firebaseUid});
        setSummary(summaryData);
      } catch (err) {
        logger.error('Failed to load user summary:', err);
      }
    };

    loadSummary();
  }, [firebaseUid]);

  const tabs: Tab[] = useMemo(() => {
    return [
      {
        id: 'content',
        label: 'Content',
        count: summary?.content,
        content: (
          <UserContentTable
            firebaseUid={firebaseUid}
            isActive={activeTab === 'content'}
          />
        )
      },
      {
        id: 'payments',
        label: 'Payments',
        count: summary?.payments,
        content: (
          <UserPaymentsTable
            firebaseUid={firebaseUid}
            isActive={activeTab === 'payments'}
          />
        )
      },
      {
        id: 'devices',
        label: 'Devices',
        count: summary?.devices,
        content: (
          <UserDevicesTable
            firebaseUid={firebaseUid}
            isActive={activeTab === 'devices'}
          />
        )
      },
      {
        id: 'notifications',
        label: 'Notifications',
        count: summary?.notifications,
        content: (
          <UserNotificationsTable
            firebaseUid={firebaseUid}
            isActive={activeTab === 'notifications'}
          />
        )
      },
      {
        id: 'auth-events',
        label: 'Auth Events',
        count: summary?.authEvents,
        content: (
          <UserAuthEventsTable
            firebaseUid={firebaseUid}
            isActive={activeTab === 'auth-events'}
          />
        )
      },
    ];
  }, [firebaseUid, activeTab, summary]);

  return (
    <Card className='grow min-h-0'>
      <TabPanel 
        tabs={tabs} 
        defaultActiveTab={activeTab}
        onTabChange={setActiveTab}
      />
    </Card>      
  );
}