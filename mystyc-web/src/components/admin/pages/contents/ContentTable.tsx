import { AlarmClockCheck, Bell, Globe, Users, UserPlus } from 'lucide-react';

import { Content } from 'mystyc-common/schemas';
import { Pagination } from 'mystyc-common/admin';
import { formatDateForDisplay } from '@/util/dateTime';
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

interface ContentTableProps {
  data?: Content[] | null;
  pagination?: Pagination | null;
  loading?: boolean;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onRefresh: () => void;
  hideSourceColumn?: boolean;
}

export default function ContentTable({
  data,
  pagination,
  loading,
  currentPage,
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
    { key: 'cost', header: 'Cost', link: (u) => `/admin/content/${u._id}`, align: "right",
      render: (u) =>
          u.error
          ? <span className="text-red-500">${u.openAIData?.cost}</span>
          : "$" + (u.openAIData?.cost ? u.openAIData?.cost : "0")},
  ];

  const sourceColumn: Column<Content> = {
    key: 'source', 
    header: 'Source', 
    align: 'center', 
    link: (u) => 
      u.executionId ? `/admin/schedule-execution/${u.executionId}` :
      u.notificationId ? `/admin/notifications/${u.notificationId}` :
      u.userId ? (u.type == 'user_content' ? null : `/admin/users/${u.userId}`) :
      null,
    icon: (u) => 
      u.executionId ? AlarmClockCheck :
      u.notificationId ? Bell :
      u.userId ? (u.type == 'user_content' ? Users : UserPlus) : 
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
      data={data}
      columns={columns}
      loading={loading}
      currentPage={currentPage}
      totalPages={pagination?.totalPages}
      hasMore={pagination?.hasMore}
      onPageChange={onPageChange}
      onRefresh={onRefresh}
      emptyMessage="No Content found."
    />
  );
}