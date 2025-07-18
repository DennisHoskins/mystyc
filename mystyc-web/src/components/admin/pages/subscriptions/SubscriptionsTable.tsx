'use client';

import { Subscription } from '@/interfaces';

import AdminTable, { Column } from '@/components/admin/ui/AdminTable';

interface SubscriptionsTableProps {
  label?: string;
  data: Subscription[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export default function SubscriptionsTable({
  label,
  data,
  loading,
  currentPage,
  totalPages,
  hasMore,
  onPageChange,
  onRefresh,
}: SubscriptionsTableProps) {
  const columns: Column<Subscription>[] = [
    { key: 'id', header: 'Id', render: (s) => s._id },
    { key: 'user', header: 'User', link: (s) => `/admin/user/${s.userId}` },
  ];

  return (
    <AdminTable<Subscription>
      label={label}
      data={data}
      columns={columns}
      loading={loading}
      currentPage={currentPage}
      totalPages={totalPages}
      hasMore={hasMore}
      onPageChange={onPageChange}
      onRefresh={onRefresh}
      emptyMessage="No Subscriptions found."
    />
  );
}