'use client';

import { useEffect, useMemo, useState } from 'react';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { logger } from '@/util/logger';

import Card from '@/components/ui/Card';
import TabPanel, { Tab } from '@/components/ui/TabPanel';
import UserContentTable from './UserContentTable';
import UserOpenAIRequestsTable from './UserOpenAIRequestsTable';
import UserAuthEventsTable from './UserAuthEventsTable';
import UserNotificationsTable from './UserNotificationsTable';

interface UserSummary {
  content: { total: number };
  requests: { total: number };
  authEvents: { total: number };
  notifications: { total: number };
}

export default function UserTabPanel({ firebaseUid }: { firebaseUid: string | null }) {
  const [activeTab, setActiveTab] = useState('content');
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
        id: 'requests',
        label: 'OpenAI Requests',
        count: summary?.requests.total,
        content: (
          <UserOpenAIRequestsTable
            firebaseUid={firebaseUid}
            isActive={activeTab === 'requests'}
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