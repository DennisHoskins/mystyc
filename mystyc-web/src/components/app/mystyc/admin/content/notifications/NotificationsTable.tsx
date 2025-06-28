'use client';

import { Notification } from '@/interfaces';
import AdminTable, { Column } from '@/components/app/mystyc/admin/ui/AdminTable';
import { formatDateForDisplay } from '@/util/dateTime';

interface NotificationsTableProps {
  label?: string;
  data: Notification[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  onRefresh: () => void;
}

export default function NotificationsTable({
  label,
  data,
  loading,
  error,
  currentPage,
  hasMore,
  onPageChange,
  onRetry,
  onRefresh
}: NotificationsTableProps) {
  const columns: Column<Notification>[] = [
    { key: 'event', header: 'Event', render: (e) => e.type || 'Unknown' },
    { key: 'deviceName', header: 'Device', render: (e) => e.deviceName || 'Unknown' },
    { key: 'message', header: 'Message', render: (e) => e.title || 'Unknown' },
    { key: 'sentAt', header: 'Sent', align: 'right', render: (e) => formatDateForDisplay(e.sentAt) || '-' },
  ];

  return (
    <AdminTable<Notification>
      label={label}
      data={data}
      columns={columns}
      loading={loading}
      error={error}
      currentPage={currentPage}
      hasMore={hasMore}
      onPageChange={onPageChange}
      onRetry={onRetry}
      onRefresh={onRefresh}
      emptyMessage="No Notifications found."
    />
  );
}