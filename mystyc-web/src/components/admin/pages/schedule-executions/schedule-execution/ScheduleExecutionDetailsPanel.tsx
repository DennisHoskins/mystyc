'use client'

import { useState, useEffect, useCallback } from 'react';

import { Schedule } from 'mystyc-common/schemas';
import { getSchedule } from '@/server/actions/admin/schedules';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { ScheduleExecution } from 'mystyc-common/schemas';
import { formatTimestampForComponent } from '@/util/dateTime';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function ScheduleExecutionDetailsPanel({ execution }: { execution?: ScheduleExecution | null }) {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSchedule = useCallback(async (execution?: ScheduleExecution | null) => {
    if (!execution) {
      return;
    }
    try {
      setError(null);
      const data = await getSchedule({deviceInfo: getDeviceInfo(), scheduleId: execution.scheduleId});
      setSchedule(data);
    } catch (err) {
      logger.error('Failed to load schedule:', err);
      setError('Failed to load schedule. Please try again.');
    }
  }, []);

  useEffect(() => {
    loadSchedule(execution);
  }, [loadSchedule, execution]);

  console.log(error);

  return (
    <AdminDetailGrid cols={3}>
      <AdminDetailField
        label="Status"
        value={execution?.status}
      />
      <AdminDetailField
        label="Scheduled Time"
        value={execution && (execution.scheduledTime.hour + ":" + execution.scheduledTime.minute)}
      />
      <AdminDetailField
        label="Executed Time"
        value={execution && (execution.executedAt ? formatTimestampForComponent(new Date(execution.executedAt).getTime()) : '-')}
      />
      <AdminDetailField
        label="Local Time"
        value={execution && 
          execution.localTime ? formatTimestampForComponent(new Date(execution.localTime).getTime()) : 
          execution?.executedAt ? formatTimestampForComponent(new Date(execution.executedAt).getTime()) : 
          ""
        }
      />
      <AdminDetailField
        label="Timezone"
        value={execution?.timezone || "UTC"}
      />
      <AdminDetailField
        label="Duration"
        value={execution?.duration}
      />
      <AdminDetailField
        label="Schedule Name"
        value={schedule?.event_name}
        href={'/admin/schedules/' + schedule?._id}
      />
      <AdminDetailField
        label="Schedule ID"
        value={schedule?._id}
        href={'/admin/schedules/' + schedule?._id}
      />
      <AdminDetailField
        label="Timezone Aware"
        value={schedule?.timezone_aware ? "Yes" : "No"}
      />
    </AdminDetailGrid>
  );
}