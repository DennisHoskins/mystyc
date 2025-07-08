'use client';

import { Content } from '@/interfaces';
import { formatDateForDisplay } from '@/util/dateTime';

import AdminTable, { Column } from '@/components/app/mystyc/admin/ui/AdminTable';
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
  onRefresh
}: ContentTableProps) {
  const columns: Column<Content>[] = [
    { key: 'date', header: 'Date', link: (u) => `/admin/content/${u._id}`, render: (u) => formatDateForDisplay(u.date) || '-' },
    { key: 'title', header: 'Title', link: (u) => `/admin/content/${u._id}` },
    { key: 'message', header: 'Message', link: (u) => `/admin/content/${u._id}` },
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
      emptyMessage="No Users found."
    />
  );
}