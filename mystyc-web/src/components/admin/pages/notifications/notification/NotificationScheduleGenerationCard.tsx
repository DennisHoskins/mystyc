'use client'

import { useState, useEffect, useCallback } from 'react';

import { Schedule, ScheduleExecution, Notification, Content } from 'mystyc-common/schemas';
import { getSchedule, getExecution } from '@/server/actions/admin/schedules';
import { getContent } from '@/server/actions/admin/content';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import AdminCard from '@/components/admin/ui/AdminCard';
import ScheduleIcon from '@/components/admin/ui/icons/ScheduleIcon';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import { formatDateForComponent } from '@/util/dateTime';
import Panel from '@/components/ui/Panel';

export default function NotificationScheduleGenerationCard({ notification }: { notification?: Notification | null }) {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [execution, setExecution] = useState<ScheduleExecution | null>(null);
  const [content, setContent] = useState<Content | null>(null);
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
      if (notification.contentId) {
        const content = await getContent({deviceInfo: getDeviceInfo(), contentId: notification.contentId});
        setContent(content);
      }
    } catch (err) {
      logger.error('Failed to load schedule:', err);
      setError('Failed to load schedule. Please try again.');
    }
  }, []);

console.log(error);

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
    <AdminCard
      icon={<ScheduleIcon />}
      title='Generation'
      href={`/admin/schedules/${notification.scheduleId}`}
      className='flex-1 grow'
    >
      <AdminDetailGrid cols={1}>
        <Panel>
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
        {content &&
          <Panel>
            <AdminDetailField
              label="Content Id"
              value={content.contentId}
              href={`/admin/content/${content.contentId}`}
            />
            <AdminDetailField
              label="Content Type"
              value={content.type}
              href={`/admin/content/${content.contentId}`}
            />
            <AdminDetailField
              label="Sources"
              value={content.sources}
            />
          </Panel>
        }
      </AdminDetailGrid>
   </AdminCard>
  );
}

