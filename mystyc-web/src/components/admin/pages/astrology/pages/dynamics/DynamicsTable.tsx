'use client'

import { Dynamic } from 'mystyc-common/schemas';
import { Pagination } from 'mystyc-common/admin';
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

interface DynamicsTableProps {
  dynamics?: Dynamic[];
  pagination?: Pagination;
  currentPage: number;
  loadDynamics: (currentPage: number) => void
}

export default function DynamicsTable({ dynamics, pagination, currentPage, loadDynamics }: DynamicsTableProps) {
  const columns: Column<Dynamic>[] = [
    { key: 'dynamic', header: 'Dynamic', link: (d) => `/admin/astrology/dynamics/${d.dynamic}` },
    { key: 'scoreValue', header: 'Score', align: 'right' },
    { key: 'keywords', header: 'Keywords', render: (d) => d.keywords.slice(0, 3).join(', ') + (d.keywords.length > 3 ? '...' : '') },
    { key: 'description', header: 'Description', render: (d) => d.description.length > 30 ? (d.description.substring(0, 30) + "...") : d.description },
  ];

  return (
    <AdminTable<Dynamic>
      data={dynamics}
      columns={columns}
      loading={dynamics == null}
      currentPage={currentPage}
      totalPages={pagination?.totalPages}
      hasMore={pagination?.hasMore}
      onPageChange={loadDynamics}
      onRefresh={() => loadDynamics(currentPage)}
      emptyMessage="No dynamics found."
    />
  );
}