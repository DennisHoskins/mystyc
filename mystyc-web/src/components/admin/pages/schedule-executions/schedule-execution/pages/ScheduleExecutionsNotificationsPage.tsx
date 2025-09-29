'use client'

import { useMemo, useState, useEffect, useCallback } from 'react';

import { Notification } from 'mystyc-common';
import { AdminListResponse } from 'mystyc-common/admin';
import { getExecutionNotifications } from '@/server/actions/admin/schedules';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import NotificationIcon from '@/components/admin/ui/icons/NotificationIcon';
import NotificationTable from '../../../notifications/NotificationsTable';

export default function ScheduleExecutionNotificationPage({ executionId } : { executionId: string}) {
  const { setBusy } = useBusy();
  const [data, setData] = useState<AdminListResponse<Notification> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const breadcrumbs = useMemo(() => [
    { label: 'Admin', href: '/admin' },
    { label: 'Schedules', href: '/admin/schedules' },
    { label: 'Executions', href: '/admin/schedule-executions' },
    { label: executionId, href: '/admin/schedule-executions/' + executionId},
    { label: "Notifications"},
  ], [executionId]);

  const loadData = useCallback(async (executionId: string) => {
    try {
      setError(null);
      setBusy(1000);
      const response = await getExecutionNotifications({deviceInfo: getDeviceInfo(), scheduleExecutionId: executionId});
      setData(response);
    } catch (err) {
      logger.error('Failed to load schedule execution notifications:', err);
      setError('Failed to load schedule execution notifications. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    if (!executionId) {
      return;
    }
    loadData(executionId);
  }, [loadData, executionId]);

  return (
   <AdminListLayout
      title="Notifications"
      error={error}
      onRetry={() => {
        loadData(executionId);
      }}
      breadcrumbs={breadcrumbs}
      icon={<NotificationIcon size={3} />}
      headerContent={
        <div className='flex flex-col grow'>
          <NotificationTable
            notifications={data}
            onRefresh={() => loadData(executionId)}
          />
        </div>
      }
    />   
  );
}
