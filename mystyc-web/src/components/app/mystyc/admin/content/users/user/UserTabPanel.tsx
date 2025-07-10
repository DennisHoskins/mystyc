'use client';

import { useEffect, useMemo, useState } from 'react';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { logger } from '@/util/logger';

import Card from '@/components/ui/Card';
import TabPanel, { Tab } from '@/components/ui/TabPanel';
import UserAuthEventsTable from './UserAuthEventsTable';
import UserNotificationsTable from './UserNotificationsTable';

interface UserSummary {
  authEvents: { total: number };
  notifications: { total: number };
}

export default function UserTabPanel({ firebaseUid }: { firebaseUid: string | null }) {
  const [activeTab, setActiveTab] = useState('auth-events');
  const [summary, setSummary] = useState<UserSummary | null>(null);

  // Load summary data (all counts)
  useEffect(() => {
    if (!firebaseUid) {
      return;
    }

    const loadSummary = async () => {
      try {
        const summaryData = await apiClientAdmin.getUserSummary(firebaseUid);
        setSummary(summaryData);
      } catch (err) {
        logger.error('Failed to load user summary:', err);
      }
    };

    loadSummary();
  }, [firebaseUid]);

  const tabs: Tab[] = useMemo(() => {
    if (!firebaseUid) return [];

    return [
      {
        id: 'auth-events',
        label: 'Auth Events',
        count: summary?.authEvents.total,
        content: (
          <UserAuthEventsTable
            firebaseUid={firebaseUid}
            isActive={activeTab === 'auth-events'}
          />
        )
      },
      {
        id: 'notifications',
        label: 'Notifications',
        count: summary?.notifications.total,
        content: (
          <UserNotificationsTable
            firebaseUid={firebaseUid}
            isActive={activeTab === 'notifications'}
          />
        )
      }
    ];
  }, [firebaseUid, activeTab, summary]);

  if (!firebaseUid) {
    return null;
  }

  return (
    <Card className='h-[56rem]'>
      <TabPanel 
        tabs={tabs} 
        defaultActiveTab="auth-events"
        height="900px"
        onTabChange={setActiveTab}
      />
    </Card>      
  );
}