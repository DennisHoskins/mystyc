'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';

import { ScheduleExecution } from 'mystyc-common/schemas';
import { getExecution, getExecutionSummary } from '@/server/actions/admin/schedules';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
import ScheduleIcon from '@/components/admin/ui/icons/ScheduleIcon';
import ScheduleExecutionDetailsPanel from './ScheduleExecutionDetailsPanel';
import ScheduleExecutionNotificationsCard from './cards/ScheduleExecutionNotificationsCard';

export default function ScheduleExecutionPage({ executionId }: { executionId: string }) {
  const { setBusy } = useBusy();
  const [summary, setSummary] = useState<{ contents: { total: number }; notifications: { total: number }} | null>(null);
  const [execution, setScheduleExecution] = useState<ScheduleExecution | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadScheduleExecution = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);
      const summary = await getExecutionSummary({deviceInfo: getDeviceInfo(), executionId});
      setSummary(summary);
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

  const notificationsClass = summary?.notifications.total ? "flex-1 grow" : "";
  const sidecontent = [];
  if (summary?.notifications.total) sidecontent.push(<ScheduleExecutionNotificationsCard key='notifications' executionId={execution?._id} className={notificationsClass} />);

console.log(summary?.contents.total, summary?.notifications.total, sidecontent.length);

  return (
    <AdminItemLayout
      error={error}
      onRetry={loadScheduleExecution}
      breadcrumbs={breadcrumbs}
      icon={<ScheduleIcon size={6} variant='schedule-execution' />}
      title={execution?.eventName || `Schedule Execution`}
      headerContent={<ScheduleExecutionDetailsPanel execution={execution} />}
      sideContent={sidecontent}
    />
  );
}