'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';

import { Schedule } from 'mystyc-common/schemas';
import { getSchedule } from '@/server/actions/admin/schedules';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import ScheduleIcon from '@/components/admin/ui/icons/ScheduleIcon';
import ScheduleDetailsPanel from './ScheduleDetailsPanel';
import ScheduleExecutionsPanel from './ScheduleExecutionsPanel';

export default function SchedulePage({ scheduleId }: { scheduleId: string }) {
  const { setBusy } = useBusy();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSchedule = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const data = await getSchedule({deviceInfo: getDeviceInfo(), scheduleId});
      setSchedule(data);
    } catch (err) {
      logger.error('Failed to load schedule:', err);
      setError('Failed to load schedule. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [scheduleId, setBusy]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const breadcrumbs = useMemo(() => [
    { label: 'Admin', href: '/admin' },
    { label: 'Schedules', href: '/admin/schedules' },
    { label: schedule ? (schedule.event_name || `Schedule ${scheduleId}`) : ``},
  ], [schedule, scheduleId]);

  return (
    <AdminListLayout
      error={error}
      onRetry={loadSchedule}
      breadcrumbs={breadcrumbs}
      icon={<ScheduleIcon size={6} />}
      title={schedule?.event_name || `Unknown Schedule`}
      headerContent={<ScheduleDetailsPanel schedule={schedule} />}
      mainContent={<ScheduleExecutionsPanel scheduleId={scheduleId} />}
    />
  );
}