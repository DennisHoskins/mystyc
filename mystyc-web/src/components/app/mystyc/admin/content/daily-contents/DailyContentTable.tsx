'use client';

import { DailyContent } from '@/interfaces';
import { formatDateForDisplay } from '@/util/dateTime';

import AdminTable, { Column } from '@/components/app/mystyc/admin/ui/AdminTable';
import { IconComponent } from '@/components/ui/icons/Icon';

interface DailyContentTableProps {
  icon?: IconComponent,
  label?: string,
  data: DailyContent[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  onRefresh: () => void;
}

export default function DailyContentTable({
  icon,
  label,
  data,
  loading,
  error,
  currentPage,
  totalPages,
  totalItems,
  hasMore,
  onPageChange,
  onRetry,
  onRefresh
}: DailyContentTableProps) {
  const columns: Column<DailyContent>[] = [
    { key: 'date', header: 'Date', link: (u) => `/admin/daily-content/${u._id}`, render: (u) => formatDateForDisplay(u.date) || '-' },
    { key: 'title', header: 'Title', link: (u) => `/admin/daily-content/${u._id}` },
    { key: 'message', header: 'Message', link: (u) => `/admin/daily-content/${u._id}` },
  ];

  return (
    <AdminTable<DailyContent>
      icon={icon}
      label={label}
      data={data}
      columns={columns}
      loading={loading}
      error={error}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      hasMore={hasMore}
      onPageChange={onPageChange}
      onRetry={onRetry}
      onRefresh={onRefresh}
      emptyMessage="No Users found."
    />
  );
}