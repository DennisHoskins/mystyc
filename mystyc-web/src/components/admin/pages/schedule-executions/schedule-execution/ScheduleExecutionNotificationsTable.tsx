'use client'

import { useEffect, useCallback, useState } from 'react';

import { Notification } from 'mystyc-common/schemas';
import { AdminListResponse } from 'mystyc-common/admin/interfaces/responses';
import { getExecutionNotifications } from '@/server/actions/admin/schedules';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { formatDateForDisplay } from '@/util/dateTime';
import { logger } from '@/util/logger';
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

export default function ScheduleExecutionsNotificationsTable({ executionId, isActive }: { executionId: string | null | undefined, isActive?: boolean }) {
  const [notifications, setNotifications] = useState<AdminListResponse<Notification> | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadScheduleExecutionNotifications = useCallback(async (page: number) => {
    if (!executionId) {
      return;
    }
    try {
      setLoading(true);

      const listQuery = getDefaultListQuery(page);
      const response = await getExecutionNotifications({deviceInfo: getDeviceInfo(), scheduleExecutionId: executionId, ...listQuery}); 
      setNotifications(response);

      setHasMore(response.pagination.hasMore == true);
      setCurrentPage(page);
      setTotalItems(response.pagination.totalItems);
      setTotalPages(response.pagination.totalPages);
      setHasLoaded(true);
    } catch (err) {
      logger.error('Failed to load schedule execution notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [executionId]);

  useEffect(() => {
    if (!executionId) {
      return;
    }

    if (isActive && !hasLoaded) {
      loadScheduleExecutionNotifications(0);
    }
  }, [executionId, loadScheduleExecutionNotifications, isActive, hasLoaded]);

  if (!notifications?.data) {
    return null;
  }

  const columns: Column<Notification>[] = [
    { key: 'sent', header: 'Sent', link: (u) => `/admin/notifications/${u._id}`, render: (u) => formatDateForDisplay(u.sentAt) + " UDT" || '-' },
    { key: 'title', header: 'Title', link: (u) => `/admin/notifications/${u._id}` },
    { key: 'device', header: 'Device', link: (u) => `/admin/devices/${u.deviceId}`, render: (u) => u.deviceName || "Unknown Device" },
    { key: 'user', header: 'User', link: (u) => `/admin/users/${u.firebaseUid}`, render: (u) => u.firebaseUid || "Unknown User" },
  ];

  return (
    <AdminTable<Notification>
      data={notifications.data}
      columns={columns}
      loading={loading}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      hasMore={hasMore}
      onPageChange={loadScheduleExecutionNotifications}
      onRefresh={() => loadScheduleExecutionNotifications(currentPage)}
      emptyMessage="No Notifications found."
    />
  );
}