'use client'

import { useEffect, useCallback, useState } from 'react';

import { Content } from 'mystyc-common/schemas';
import { AdminListResponse } from 'mystyc-common/admin/interfaces/responses';
import { getExecutionContent } from '@/server/actions/admin/schedules';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import ContentsCard from '../../../contents/ContentsCard';

export default function ScheduleExecutionsContentCard({ executionId, className }: { executionId: string | null | undefined, className?: string }) {
  const [content, setContent] = useState<AdminListResponse<Content> | null>(null);

  const loadScheduleExecutionContent = useCallback(async (executionId: string) => {
    try {
      const listQuery = getDefaultListQuery(0);
      listQuery.limit = 3;
      const response = await getExecutionContent({deviceInfo: getDeviceInfo(), scheduleExecutionId: executionId, ...listQuery}); 
      setContent(response);
    } catch (err) {
      logger.error('Failed to load schedule execution content:', err);
    }
  }, []);

  useEffect(() => {
   if (!executionId) {
      return;
    }
    loadScheduleExecutionContent(executionId);
  }, [executionId, loadScheduleExecutionContent]);

  return (
    <ContentsCard 
      className={className}
      content={content?.data} 
      total={content?.pagination.totalItems} 
      href={`/admin/schedule-executions/${executionId}/content`} 
    />
  );
}