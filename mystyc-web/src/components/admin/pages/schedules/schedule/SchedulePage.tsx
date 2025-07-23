'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

import { Schedule } from 'mystyc-common/schemas';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { logger } from '@/util/logger';

import { useBusy } from '@/components/ui/layout/context/AppContext';
import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
import ScheduleIcon from '@/components/admin/ui/icons/ScheduleIcon';
import ScheduleDetailsPanel from './ScheduleDetailsPanel';
import ScheduleExecutionsCard from './ScheduleExecutionsCard';

export default function SchedulePage({ scheduleId }: { scheduleId: string }) {
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSchedule = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);
      setLoading(true);

      const data = await apiClientAdmin.getSchedule(scheduleId);
      setSchedule(data);
    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'SchedulePage');
      if (!wasSessionError) {
        logger.error('Failed to load schedule:', err);
        setError('Failed to load schedule. Please try again.');
      }
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [scheduleId, setBusy, handleSessionError]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const breadcrumbs = useMemo(() => [
    { label: 'Admin', href: '/admin' },
    { label: 'Schedules', href: '/admin/schedules' },
    { label: schedule ? (schedule.event_name || `Schedule ${scheduleId}`) : ``},
  ], [schedule, scheduleId]);

  if (loading) {
    return null;
  }

  if (!schedule) {
    return (
      <AdminItemLayout
        error={'Schedule Not Found'}
        onRetry={loadSchedule}
        breadcrumbs={breadcrumbs}
        icon={<ScheduleIcon size={6}/>}
        title={'Unkown Schedule'}
      />
    );
  }

  return (
    <AdminItemLayout
      error={error}
      onRetry={loadSchedule}
      breadcrumbs={breadcrumbs}
      icon={<ScheduleIcon size={6} />}
      title={schedule.event_name || `Unknown Schedule`}
      headerContent={<ScheduleDetailsPanel schedule={schedule} />}
      mainContent={<ScheduleExecutionsCard scheduleId={scheduleId} />}
    />
  );
}