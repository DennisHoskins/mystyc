'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';

import { ScheduleExecution } from 'mystyc-common/schemas';
import { getExecution } from '@/server/actions/admin/schedules';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
import ScheduleIcon from '@/components/admin/ui/icons/ScheduleIcon';
import ScheduleExecutionDetailsPanel from './ScheduleExecutionDetailsPanel';

export default function ScheduleExecutionPage({ executionId }: { executionId: string }) {
  const { setBusy } = useBusy();
  const [execution, setScheduleExecution] = useState<ScheduleExecution | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadScheduleExecution = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const data = await getExecution({deviceInfo: getDeviceInfo(), scheduleExecutionId: executionId});
      setScheduleExecution(data);
    } catch (err) {
      logger.error('Failed to load schedule execution:', err);
      setError('Failed to load schedule execution. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [executionId, setBusy]);

  useEffect(() => {
    loadScheduleExecution();
  }, [loadScheduleExecution]);

  const breadcrumbs = useMemo(() => [
    { label: 'Admin', href: '/admin' },
    { label: 'Schedules', href: '/admin/schedules' },
    { label: 'Executions', href: '/admin/schedule-executions/' },
    { label: execution ? (execution.eventName || `Schedule Execution ${executionId}`) : ``},
  ], [execution, executionId]);
  
  return (
    <AdminItemLayout
      error={error}
      onRetry={loadScheduleExecution}
      breadcrumbs={breadcrumbs}
      icon={<ScheduleIcon size={6} variant='schedule-execution' />}
      title={execution?.eventName || `Schedule Execution`}
      headerContent={<ScheduleExecutionDetailsPanel execution={execution} />}
      // mainContent={<ScheduleExecutionTabCard executionId={executionId} />}
    />
  );
}