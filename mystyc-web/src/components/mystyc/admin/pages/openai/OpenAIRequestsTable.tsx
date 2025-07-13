'use client';

import { OpenAIRequest } from '@/interfaces';

import AdminTable, { Column } from '@/components/mystyc/admin/ui/AdminTable';
import { formatDateForDisplay } from '@/util/dateTime';

interface OpenAIRequestsTableProps {
  label?: string;
  data: OpenAIRequest[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export default function OpenAIRequestsTable({
  label,
  data,
  loading,
  currentPage,
  totalPages,
  totalItems,
  hasMore,
  onPageChange,
  onRefresh,
}: OpenAIRequestsTableProps) {
  const columns: Column<OpenAIRequest>[] = [
    { key: 'id', header: 'ID', link: (r) => `/admin/openai/${r._id}`, render: (r) => r._id },
    { key: 'date', header: 'Generated', link: (r) => `/admin/openai/${r._id}`, render: (r) => formatDateForDisplay(r.createdAt) },
    { key: 'prompt', header: 'Prompt', link: (r) => `/admin/openai/${r._id}`, render: (r) => r.prompt.substring(0, 40) + "..." },
    { key: 'cost', header: 'Cost', align: 'right', link: (r) => `/admin/openai/${r._id}`, render: (r) => r.cost },
    { key: 'type', header: 'Cost', align: 'right', link: (r) => `/admin/openai/${r._id}`, render: (r) => r.requestType },
  ];

  return (
    <AdminTable<OpenAIRequest>
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
      emptyMessage="No OpenAI requests found."
    />
  );
}