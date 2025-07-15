'use client';

import { useEffect, useMemo, useState } from 'react';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { logger } from '@/util/logger';

import Card from '@/components/ui/Card';
import TabPanel, { Tab } from '@/components/ui/TabPanel';
import AllContentTable from './AllContentTable';
import WebsiteContentTable from './WebsiteContentTable';
import NotificationsContentTable from './NotificationsContentTable';
import UsersContentTable from './UsersContentTable';

interface ContentSummary {
  content: { total: number };
  website: { total: number };
  notifications: { total: number };
  users: { total: number };
}

export default function ContentsTabPanel() {
  const [activeTab, setActiveTab] = useState('website');
  const [summary, setSummary] = useState<ContentSummary | null>(null);

  // Load summary data (all counts)
  useEffect(() => {
    const loadSummary = async () => {
      try {
        const summaryData = await apiClientAdmin.getContentsSummary();
        setSummary(summaryData);
      } catch (err) {
        logger.error('Failed to load content summary:', err);
      }
    };

    loadSummary();
  }, []);

  const tabs: Tab[] = useMemo(() => {
    return [
      {
        id: 'website',
        label: 'Website',
        count: summary?.website.total,
        content: (
          <WebsiteContentTable
            isActive={activeTab === 'website'}
          />
        )
      },
      {
        id: 'notifications',
        label: 'Notifications',
        count: summary?.notifications.total,
        content: (
          <NotificationsContentTable
            isActive={activeTab === 'notifications'}
          />
        )
      },
      {
        id: 'users',
        label: 'Users',
        count: summary?.users.total,
        content: (
          <UsersContentTable
            isActive={activeTab === 'users'}
          />
        )
      },
      {
        id: 'content',
        label: 'All Content',
        count: summary?.content.total,
        content: (
          <AllContentTable
            isActive={activeTab === 'content'}
          />
        )
      }
    ];
  }, [activeTab, summary]);

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