'use client'

import { useState, useEffect, useCallback } from 'react';

import { Schedule, ScheduleExecution, Notification } from 'mystyc-common/schemas';
import { getSchedule, getExecution } from '@/server/actions/admin/schedules';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import AdminCard from '@/components/admin/ui/AdminCard';
import ScheduleIcon from '@/components/admin/ui/icons/ScheduleIcon';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import { formatDateForComponent } from '@/util/dateTime';
import Panel from '@/components/ui/Panel';
import Text from '@/components/ui/Text';

export default function NotificationScheduleGenerationCard({ notification }: { notification?: Notification | null }) {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [execution, setExecution] = useState<ScheduleExecution | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (notification: Notification) => {
    if (!notification.scheduleId || !notification.executionId) {
      return;
    }
    try {
      setError(null);
      const schedule = await getSchedule({deviceInfo: getDeviceInfo(), scheduleId: notification.scheduleId});
      setSchedule(schedule);
      const execution = await getExecution({deviceInfo: getDeviceInfo(), scheduleExecutionId: notification.executionId});
      setExecution(execution);
    } catch (err) {
      logger.error('Failed to load schedule:', err);
      setError('Failed to load schedule. Please try again.');
    }
  }, []);

  useEffect(() => {
    if (!notification) {
      return;
    }
    loadData(notification);
  }, [loadData, notification]);

  if (error) {
    return (
      <AdminCard
        icon={<ScheduleIcon />}
        title='Generation'
        href={`/admin/schedules/`}
      > 
        <div className='flex flex-col w-full min-h-0 items-center justify-center'>
          <Text variant='body'>Unable to load data</Text>
        </div>
      </AdminCard>
    );
  }

  if (!notification || !notification.scheduleId) {
    return null;
  }

  return (
    <AdminCard
      icon={<ScheduleIcon />}
      title='Generation'
      href={`/admin/schedules/${notification.scheduleId}`}
      className='flex-1 grow'
    >
      <AdminDetailGrid cols={1}>
        <Panel padding={4}>
          <AdminDetailField
            label="Schedule Id"
            value={schedule && schedule.event_name}
            href={`/admin/schedules/${notification.scheduleId}`}
          />
          <AdminDetailField
            label="Schedule Name"
            value={schedule && schedule.event_name}
            href={`/admin/schedules/${notification.scheduleId}`}
          />
          <AdminDetailField
            label="Executed"
            value={execution && formatDateForComponent(execution.executedAt)}
            href={`/admin/schedule-executions/${notification.executionId}`}
          />
        </Panel>
      </AdminDetailGrid>
   </AdminCard>
  );
}

