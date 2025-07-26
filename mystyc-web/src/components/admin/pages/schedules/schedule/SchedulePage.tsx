'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

import { Schedule } from 'mystyc-common/schemas';

import { apiClientAdmin } from '@/api/admin/apiClientAdmin';
import { logger } from '@/util/logger';

import { useBusy } from '@/components/ui/layout/context/AppContext';
import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
import ScheduleIcon from '@/components/admin/ui/icons/ScheduleIcon';
import ScheduleDetailsPanel from './ScheduleDetailsPanel';
import ScheduleExecutionsCard from './ScheduleExecutionsCard';

export default function SchedulePage({ scheduleId }: { scheduleId: string }) {
  const { setBusy } = useBusy();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSchedule = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const data = await apiClientAdmin.schedule.getSchedule(scheduleId);
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
    <AdminItemLayout
      error={error}
      onRetry={loadSchedule}
      breadcrumbs={breadcrumbs}
      icon={<ScheduleIcon size={6} />}
      title={schedule?.event_name || `Unknown Schedule`}
      headerContent={<ScheduleDetailsPanel schedule={schedule} />}
      mainContent={<ScheduleExecutionsCard scheduleId={scheduleId} />}
    />
  );
}