'use client'

import { useState, useEffect, useCallback } from 'react';

import { ScheduleExecution } from 'mystyc-common/schemas/schedule-execution.schema';
import { getExecution } from '@/server/actions/admin/schedules';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import AdminCard from '@/components/admin/ui/AdminCard';
import Panel from '@/components/ui/Panel';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import ScheduleIcon from '@/components/admin/ui/icons/ScheduleIcon'
import { formatDateForComponent } from '@/util/dateTime';

export default function ScheduleExecutionCard({ executionId, className }: { executionId?: string | null, className?: string }) {
  const [execution, setScheduleExecution] = useState<ScheduleExecution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadScheduleExecution = useCallback(async () => {
    if (!executionId) {
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getExecution({deviceInfo: getDeviceInfo(), scheduleExecutionId: executionId});
      setScheduleExecution(data);
    } catch (err) {
      logger.error('Failed to load execution:', err);
      setError('Failed to load execution. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [executionId]);

  useEffect(() => {
    loadScheduleExecution();
  }, [loadScheduleExecution]);

  if (loading) {
    return null;
  }

  if (error) {
    return (
      <div>{error}</div>
    )
  }

  if (!execution) {
    return (
      <div>Schedule Execution not found</div>
    )
  }
  return (
    <AdminCard
      icon={<ScheduleIcon />}
      title={execution.eventName}
      href={`/admin/schedule-executions/${executionId}`}
      className={`flex flex-col space-y-1 ${className}`}
    >
      <Panel padding={4}>
        <AdminDetailGrid>
          <AdminDetailField
            label="Schedule Execution Id"
            value={execution._id}
            href={`/admin/executions/${executionId}`}
          />
          <AdminDetailField
            label="Schedule"
            value={execution.scheduleId}
            href={`/admin/schedules/${execution.scheduleId}`}
          />
          <AdminDetailField
            label="Status"
            value={execution.status}
          />
          <AdminDetailField
            label="Scheduled Time"
            value={execution.scheduledTime.hour + ":" + execution.scheduledTime.minute.toString().padEnd(2, '0')}
          />
          <AdminDetailField
            label="Executed"
            value={formatDateForComponent(execution.executedAt)}
          />
        </AdminDetailGrid>
      </Panel>
    </AdminCard>
  );
}