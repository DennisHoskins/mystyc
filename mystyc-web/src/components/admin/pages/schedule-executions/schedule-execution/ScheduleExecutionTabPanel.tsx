'use client';

import { useEffect, useMemo, useState } from 'react';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { logger } from '@/util/logger';

import Card from '@/components/ui/Card';
import TabPanel, { Tab } from '@/components/ui/TabPanel';
import ScheduleExecutionContentTable from './ScheduleExecutionContentTable';
import ScheduleExecutionNotificationsTable from './ScheduleExecutionNotificationsTable';

interface ScheduleExecutionSummary {
  contents: { total: number };
  notifications: { total: number };
}

export default function ScheduleExecutionTabPanel({ executionId }: { executionId: string }) {
  const [activeTab, setActiveTab] = useState('content');
  const [summary, setSummary] = useState<ScheduleExecutionSummary | null>(null);

  // // Load summary data (all counts)
  useEffect(() => {
    if (!executionId) return;

    const loadSummary = async () => {
      try {
        const summaryData = await apiClientAdmin.getScheduleExecutionsSummary(executionId);
        setSummary(summaryData);
      } catch (err) {
        logger.error('Failed to load device summary:', err);
      }
    };

    loadSummary();
  }, [executionId]);

  const tabs: Tab[] = useMemo(() => {
    if (!executionId) return [];

    return [
      {
        id: 'content',
        label: 'Content',
        count: summary?.contents.total,
        content: (
          <ScheduleExecutionContentTable
            executionId={executionId}
            isActive={activeTab === 'content'}
          />
        )
      },
      {
        id: 'notifications',
        label: 'Notifications',
        count: summary?.notifications.total,
        content: (
          <ScheduleExecutionNotificationsTable
            executionId={executionId}
            isActive={activeTab === 'notifications'}
          />
        )
      }
    ];
  }, [executionId, activeTab, summary]);

  return (
    <Card className='h-[56rem]'>
      <TabPanel 
        tabs={tabs} 
        defaultActiveTab={activeTab}
        onTabChange={setActiveTab}
      />
    </Card>      
  );
}