'use client'

import { useEffect, useMemo, useState } from 'react';

import { getExecutionsSummary } from '@/server/actions/admin/schedules';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import Card from '@/components/ui/Card';
import TabPanel, { Tab } from '@/components/ui/TabPanel';
import ScheduleExecutionContentTable from './ScheduleExecutionContentTable';
import ScheduleExecutionNotificationsTable from './ScheduleExecutionNotificationsTable';

interface ScheduleExecutionSummary {
  contents: { total: number };
  notifications: { total: number };
}

export default function ScheduleExecutionTabCard({ executionId }: { executionId: string }) {
  const [activeTab, setActiveTab] = useState('notifications');
  const [summary, setSummary] = useState<ScheduleExecutionSummary | null>(null);

  useEffect(() => {
    if (!executionId) return;

    const loadSummary = async () => {
      try {
        const summaryData = await getExecutionsSummary({deviceInfo: getDeviceInfo(), executionId});
        setSummary(summaryData);
      } catch (err) {
        logger.error('Failed to load device summary:', err);
      }
    };

    loadSummary();
  }, [executionId]);

  const tabs: Tab[] = useMemo(() => {
    return [
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
      },
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
    ];
  }, [executionId, activeTab, summary]);

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