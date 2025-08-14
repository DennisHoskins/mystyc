'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';

import { Schedule, ScheduleExecution, Notification } from 'mystyc-common/schemas';
import { getSchedule, getExecution } from '@/server/actions/admin/schedules';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import Card from '@/components/ui/Card';
import Link from '@/components/ui/Link';
import Heading from '@/components/ui/Heading';
import Avatar from '@/components/ui/Avatar';
import ScheduleIcon from '@/components/admin/ui/icons/ScheduleIcon';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import { formatDateForComponent } from '@/util/dateTime';

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

  if (!notification || !notification.scheduleId) {
    return null;
  }

  return (
    <Card className='flex-1 grow'>
      <div className="flex items-center space-x-2">
        <Avatar size={'small'} icon={ScheduleIcon} />
        <Link href={`/admin/schedules/${notification.scheduleId}`} className='flex w-full'>
          <Heading level={4} className='flex-1'>Generation</Heading>
        </Link>          
      </div>
      <hr />
      <AdminDetailGrid cols={3} className='pt-1'>
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
      </AdminDetailGrid>
   </Card>
  );
}

