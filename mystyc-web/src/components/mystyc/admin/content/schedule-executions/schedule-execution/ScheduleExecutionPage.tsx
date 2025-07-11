'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { ScheduleExecution } from '@/interfaces';
import { useBusy } from '@/components/ui/layout/context/AppContext';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { logger } from '@/util/logger';

import AdminItemLayout from '@/components/mystyc/admin/ui/AdminItemLayout';
import ScheduleIcon from '@/components/mystyc/admin/ui/icons/ScheduleIcon';
import ScheduleExecutionDetailsPanel from './ScheduleExecutionDetailsPanel';
import ScheduleExecutionContentTable from './ScheduleExecutionContentTable';
import ScheduleExecutionNotificationsTable from './ScheduleExecutionNotificationsTable';

export default function ScheduleExecutionPage({ executionId }: { executionId: string }) {
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  const [execution, setScheduleExecution] = useState<ScheduleExecution | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadScheduleExecution = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);
      setLoading(true);

      const data = await apiClientAdmin.getScheduleExecution(executionId);
      setScheduleExecution(data);
    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'ScheduleExecutionPage');
      if (!wasSessionError) {
        logger.error('Failed to load schedule execution:', err);
        setError('Failed to load schedule execution. Please try again.');
      }
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [executionId, setBusy, handleSessionError]);

  useEffect(() => {
    loadScheduleExecution();
  }, [loadScheduleExecution]);

  const breadcrumbs = useMemo(() => [
    { label: 'Admin', href: '/admin' },
    { label: 'Schedules', href: '/admin/schedules' },
    { label: 'Executions', href: '/admin/schedule-executions/' },
    { 
      label: execution ? (execution.eventName || `Schedule Execution ${executionId}`) : ``
    },
  ], [execution, executionId]);

  if (loading) {
    return null;
  }

  if (!execution) {
    return (
      <AdminItemLayout
        error={'Schedule Not Found'}
        onRetry={loadScheduleExecution}
        breadcrumbs={breadcrumbs}
        icon={<ScheduleIcon size={6} variant='schedule-execution'/>}
        title={'Unkown Schedule Execution'}
      />
    );
  }

  const executionType = execution.eventName.split(".")[0];
  const mainContent = 
    executionType == 'content' ? <ScheduleExecutionContentTable executionId={execution._id} /> :
    executionType == 'notifications' ? <ScheduleExecutionNotificationsTable executionId={execution._id} /> : null;

    return (
    <AdminItemLayout
      error={error}
      onRetry={loadScheduleExecution}
      breadcrumbs={breadcrumbs}
      icon={<ScheduleIcon size={6} variant='schedule-execution' />}
      title={execution.eventName || `Unknown Schedule Execution`}
      headerContent={<ScheduleExecutionDetailsPanel execution={execution} />}
      mainContent={mainContent}
    />
  );
}