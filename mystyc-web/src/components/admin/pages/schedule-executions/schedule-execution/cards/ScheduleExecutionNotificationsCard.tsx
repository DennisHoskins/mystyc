'use client'

import { useEffect, useCallback, useState } from 'react';

import { Notification } from 'mystyc-common/schemas';
import { AdminListResponse } from 'mystyc-common/admin/interfaces/responses';
import { getExecutionNotifications } from '@/server/actions/admin/schedules';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import NotificationsCard from '../../../notifications/NotificationsCard';

export default function ScheduleExecutionsNotificationsCard({ executionId, className }: { 
  executionId: string | null | undefined, 
  className?: string 
}) {
  const [notifications, setNotifications] = useState<AdminListResponse<Notification> | null>(null);

  const loadScheduleExecutionNotifications = useCallback(async (executionId: string) => {
    try {
      const listQuery = getDefaultListQuery(0);
      listQuery.limit = 5;
      const response = await getExecutionNotifications({deviceInfo: getDeviceInfo(), scheduleExecutionId: executionId, ...listQuery}); 
      setNotifications(response);
    } catch (err) {
      logger.error('Failed to load schedule execution notifications:', err);
    }
  }, []);

  useEffect(() => {
    if (!executionId) {
      return;
    }
    loadScheduleExecutionNotifications(executionId);
  }, [executionId, loadScheduleExecutionNotifications]);

  return (
    <NotificationsCard 
      notifications={notifications?.data} 
      total={notifications?.pagination.totalItems} 
      href={`/admin/schedule-executions/${executionId}/notifications`} 
      className={className} 
    />
  );
}