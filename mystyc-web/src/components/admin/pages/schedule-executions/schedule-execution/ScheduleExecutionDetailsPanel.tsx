'use client'

import { useState, useEffect, useCallback } from 'react';

import { Schedule } from 'mystyc-common/schemas';
import { getSchedule } from '@/server/actions/admin/schedules';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { ScheduleExecution } from 'mystyc-common/schemas';
import { formatTimestampForComponent } from '@/util/dateTime';
import Panel from '@/components/ui/Panel';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import Text from '@/components/ui/Text';

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

  if (error) {
    return (
      <div className='flex flex-col w-full min-h-0 items-center justify-center'>
        <Text variant='body'>Unable to load data</Text>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'timeout':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const cols = execution?.localTime ? 3 : 2;

  return (
    <>
      <AdminDetailGrid cols={cols}>
        <Panel padding={4}>
          <AdminDetailField
            label="Status"
            value={execution &&
              <span className={`font-medium ${getStatusColor(execution.status)}`}>
                {execution.status.charAt(0).toUpperCase() + execution.status.slice(1)}
              </span>
            }
          />
          <AdminDetailField
            label="Duration"
            value={execution?.duration && (execution.duration + 'ms')}
          />
        </Panel>
        <Panel padding={4}>
          <AdminDetailField
            label="Scheduled Time"
            value={execution && (execution.scheduledTime.hour + ":" + execution.scheduledTime.minute.toString().padEnd(2, '0'))}
          />
          <AdminDetailField
            label="Executed Time"
            value={execution && (execution.executedAt ? formatTimestampForComponent(new Date(execution.executedAt).getTime()) : '-')}
          />
        </Panel>
        {execution && execution.timezone &&
          <Panel padding={4}>
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
          </Panel>
        }
      </AdminDetailGrid>
      <AdminDetailGrid className='mt-4'>
        <Panel padding={4}>
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
        </Panel>
      </AdminDetailGrid>
    </>
  );
}