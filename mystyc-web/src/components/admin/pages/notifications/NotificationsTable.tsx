import { useState, useEffect, useCallback } from 'react';
import { AlarmClockCheck, Megaphone, User } from 'lucide-react';
import { Notification } from 'mystyc-common/schemas';
import { AdminListResponse, BaseAdminQuery } from 'mystyc-common/admin';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import { formatDateForDisplay } from '@/util/dateTime';
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

type NotificationServerAction = (params: {deviceInfo: any} & BaseAdminQuery) => Promise<AdminListResponse<Notification>>;

interface NotificationsTableProps {
  serverAction?: NotificationServerAction;
  onRefresh?: () => void;
  hideUserColumn?: boolean;
  notifications?: AdminListResponse<Notification> | null;
}

export default function NotificationsTable({
  serverAction,
  onRefresh,
  hideUserColumn = false,
  notifications
}: NotificationsTableProps) {
  const { setBusy } = useBusy();
  const [data, setData] = useState<AdminListResponse<Notification> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async (page: number) => {
    if (!serverAction) {
      return;
    }
    try {
      setError(null);
      setBusy(1000);

      const listQuery = getDefaultListQuery(page);
      const response = await serverAction({deviceInfo: getDeviceInfo(), ...listQuery});

      setData(response);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load notifications:', err);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [serverAction, setBusy]);

  const handlePageChange = (page: number) => {
    loadNotifications(page);
  };

  const handleRefresh = () => {
    loadNotifications(0);
    if (onRefresh) {
      onRefresh();
    }
  };

  useEffect(() => {
    if (notifications) {
      setData(notifications);
      setCurrentPage(0);
      return;
    }
    loadNotifications(0);
  }, [loadNotifications, notifications, setData]);

  const baseColumns: Column<Notification>[] = [
    { key: 'event', header: 'Event', link: (e) => `/admin/notifications/${e._id}`, render: (e) => e.type || 'Unknown' },
    { key: 'deviceName', header: 'Device', link: (e) => `/admin/devices/${e.deviceId}`, render: (e) => e.deviceName || 'Unknown' },
    { key: 'message', header: 'Message', render: (e) => e.title || 'Unknown' },
    { key: 'sentAt', header: 'Sent', align: 'right', link: (e) => `/admin/notifications/${e._id}`, render: (e) => formatDateForDisplay(e.sentAt) || '-' },
    { 
      key: 'source', 
      header: 'Source', 
      link: (u) => 
        u.executionId ? `/admin/schedule-execution/${u.executionId}` :
        u.firebaseUid  ? `/admin/users/${u.firebaseUid}` :
        null,
      align: 'center', 
      icon: (u) => 
        u.executionId ? AlarmClockCheck :
        u.firebaseUid && u.type == 'broadcast' ? Megaphone :
        u.firebaseUid  ? User :
        null
    },
  ];

  const userColumn: Column<Notification> = {
    key: 'userName', 
    header: 'User', 
    link: (e) => `/admin/users/${e.firebaseUid}`,
    render: (e) => e.firebaseUid || 'Unknown User'
  };

  const columns = hideUserColumn 
    ? baseColumns 
    : [
        baseColumns[0],
        userColumn,
        ...baseColumns.slice(1)
      ];

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  return (
    <AdminTable<Notification>
      data={data?.data}
      columns={columns}
      loading={data == null}
      currentPage={currentPage}
      totalPages={data?.pagination?.totalPages || 0}
      hasMore={data?.pagination?.hasMore || false}
      onPageChange={handlePageChange}
      onRefresh={handleRefresh}
      emptyMessage="No Notifications found."
    />
  );
}