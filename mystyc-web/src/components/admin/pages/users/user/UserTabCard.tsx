'use client';

import { useEffect, useMemo, useState } from 'react';

import { apiClientAdmin } from '@/api/admin/apiClientAdmin';
import { logger } from '@/util/logger';

import Card from '@/components/ui/Card';
import TabPanel, { Tab } from '@/components/ui/TabPanel';
import UserContentTable from './UserContentTable';
import UserAuthEventsTable from './UserAuthEventsTable';
import UserNotificationsTable from './UserNotificationsTable';
import UserPaymentsTable from './UserPaymentsTable';

interface UserSummary {
  content: { total: number };
  requests: { total: number };
  authEvents: { total: number };
  notifications: { total: number };
  payments: { total: number };
}

export default function UserTabCard({ firebaseUid }: { firebaseUid: string | null }) {
  const [activeTab, setActiveTab] = useState('content');
  const [summary, setSummary] = useState<UserSummary | null>(null);

  // Load summary data (all counts)
  useEffect(() => {
    if (!firebaseUid) {
      return;
    }

    const loadSummary = async () => {
      try {
        const summaryData = await apiClientAdmin.users.getUserSummary(firebaseUid);
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
        id: 'content',
        label: 'Content',
        count: summary?.content.total,
        content: (
          <UserContentTable
            firebaseUid={firebaseUid}
            isActive={activeTab === 'content'}
          />
        )
      },
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
      },
      {
        id: 'payments',
        label: 'Payments',
        count: summary?.payments.total,
        content: (
          <UserPaymentsTable
            firebaseUid={firebaseUid}
            isActive={activeTab === 'payments'}
          />
        )
      }
    ];
  }, [firebaseUid, activeTab, summary]);

  if (!firebaseUid) {
    return null;
  }

  return (
    <Card className='min-h-52'>
      <TabPanel 
        tabs={tabs} 
        defaultActiveTab={activeTab}
        height="900px"
        onTabChange={setActiveTab}
      />
    </Card>      
  );
}