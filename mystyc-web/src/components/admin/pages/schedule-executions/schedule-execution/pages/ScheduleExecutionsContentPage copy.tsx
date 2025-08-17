'use client'

import { useMemo, useState, useEffect, useCallback } from 'react';

import { Content } from 'mystyc-common';
import { AdminListResponse } from 'mystyc-common/admin';
import { getExecutionContent } from '@/server/actions/admin/schedules';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import ContentIcon from '@/components/admin/ui/icons/ContentIcon';
import ContentTable from '../../../contents/ContentTable';

export default function ScheduleExecutionContentPage({ executionId } : { executionId: string}) {
  const { setBusy } = useBusy();
  const [data, setData] = useState<AdminListResponse<Content> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const breadcrumbs = useMemo(() => [
    { label: 'Admin', href: '/admin' },
    { label: 'Schedules', href: '/admin/schedules' },
    { label: 'Executions', href: '/admin/schedule-executions' },
    { label: executionId, href: '/admin/schedule-executions/' + executionId},
    { label: "Contents"},
  ], [executionId]);

  const loadData = useCallback(async (executionId: string) => {
    try {
      setError(null);
      setBusy(1000);
      const response = await getExecutionContent({deviceInfo: getDeviceInfo(), scheduleExecutionId: executionId});
      setData(response);
    } catch (err) {
      logger.error('Failed to load schedule execution content:', err);
      setError('Failed to load schedule execution content. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    if (!executionId) {
      return;
    }
    loadData(executionId);
  }, [loadData, executionId]);

  return (
   <AdminListLayout
      title="Contents"
      error={error}
      onRetry={() => {
        loadData(executionId);
      }}
      breadcrumbs={breadcrumbs}
      icon={<ContentIcon size={3} />}
      headerContent={
        <div className='flex flex-col grow'>
          <ContentTable
            data={data?.data}
            pagination={data?.pagination}
            onRefresh={() => loadData(executionId)}
          />
        </div>
      }
    />   
  );
}
