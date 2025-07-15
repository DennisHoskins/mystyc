'use client';

import { OpenAIRequest } from '@/interfaces';

import { Bell, Globe, User } from 'lucide-react';


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
  hideSourceColumn?: boolean;
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
  hideSourceColumn = false
}: OpenAIRequestsTableProps) {
  const baseColumns: Column<OpenAIRequest>[] = [
    { key: 'id', header: 'ID', link: (r) => `/admin/openai/${r._id}`, render: (r) => r._id },
    { key: 'date', header: 'Generated', link: (r) => `/admin/openai/${r._id}`, render: (r) => formatDateForDisplay(r.createdAt) },
    { key: 'prompt', header: 'Prompt', link: (r) => `/admin/openai/${r._id}`, render: (r) => r.prompt.substring(0, 40) + "..." },
    { key: 'cost', header: 'Cost', align: 'right', link: (r) => `/admin/openai/${r._id}`, render: (r) => r.cost },
  ];

  const sourceColumn: Column<OpenAIRequest> = {
    key: 'source', 
    header: 'Source', 
    align: 'center', 
    link: (u) => 
      u.requestType === 'notification_content' ? `/admin/notifications/${u.linkedEntityId}` :
      u.requestType === 'website_content' ? `/admin/content/${u.linkedEntityId}` :
      u.requestType === 'user_content' ? `/admin/users/${u.linkedEntityId}` :
      null,
    icon: (u) => 
      u.requestType === 'notification_content' ? Bell :
      u.requestType === 'user_content' ? User :
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