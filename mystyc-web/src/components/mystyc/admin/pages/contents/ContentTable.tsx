'use client';

import { AlarmClockCheck, Bell, Globe, User } from 'lucide-react';

import { Content } from '@/interfaces';
import { formatDateForDisplay } from '@/util/dateTime';

import AdminTable, { Column } from '@/components/mystyc/admin/ui/AdminTable';
import { IconComponent } from '@/components/ui/icons/Icon';

interface ContentTableProps {
  icon?: IconComponent,
  label?: string,
  data: Content[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  hideSourceColumn?: boolean;
}

export default function ContentTable({
  icon,
  label,
  data,
  loading,
  currentPage,
  totalPages,
  totalItems,
  hasMore,
  onPageChange,
  onRefresh,
  hideSourceColumn = false
}: ContentTableProps) {
  const baseColumns: Column<Content>[] = [
    { key: 'date', header: 'Created', link: (u) => `/admin/content/${u._id}`, 
      render: (u) =>
          u.error
          ? <span className="text-red-500">{formatDateForDisplay(u.generatedAt)}</span>
          : formatDateForDisplay(u.generatedAt)},
    { key: 'status', header: 'Status', link: (u) => `/admin/content/${u._id}`, 
      render: (u) =>
        u.error
          ? <span className="text-red-500">{u.status}</span>
          : u.status},
    { key: 'title', header: 'Title', link: (u) => `/admin/content/${u._id}`, 
      render: (u) =>
          u.error
          ? <span className="text-red-500">{u.title}</span>
          : u.title},
    { key: 'request', header: 'Request', link: (u) => `/admin/openai/${u.openAIRequestId}`, 
      render: (u) =>
          u.error
          ? <span className="text-red-500">{u.openAIRequestId}</span>
          : u.openAIRequestId},
  ];

  const sourceColumn: Column<Content> = {
    key: 'source', 
    header: 'Source', 
    align: 'center', 
    link: (u) => 
      u.executionId ? `/admin/schedule-execution/${u.executionId}` :
      u.notificationId ? `/admin/notifications/${u.notificationId}` :
      u.userId ? `/admin/users/${u.userId}` :
      null,
    icon: (u) => 
      u.executionId ? AlarmClockCheck :
      u.notificationId ? Bell :
      u.userId ? User :
      Globe
  };

  const columns = hideSourceColumn 
    ? baseColumns 
    : [
        baseColumns[0],
        ...baseColumns.slice(1),
        sourceColumn,
      ];

  return (
    <AdminTable<Content>
      icon={icon}
      label={label}
      data={data}
      columns={columns}
      loading={loading}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      hasMore={hasMore}
      onPageChange={onPageChange}
      onRefresh={onRefresh}
      emptyMessage="No Content found."
    />
  );
}