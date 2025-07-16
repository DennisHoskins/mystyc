'use client';

import { OpenAIUsage } from '@/interfaces';

import AdminTable, { Column } from '@/components/mystyc/admin/ui/AdminTable';

interface OpenAIUsageTableProps {
  label?: string;
  data: OpenAIUsage[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export default function OpenAIUsageTable({
  label,
  data,
  loading,
  currentPage,
  totalPages,
  hasMore,
  onPageChange,
  onRefresh,
}: OpenAIUsageTableProps) {
  const columns: Column<OpenAIUsage>[] = [
    { key: 'month', header: 'Month' },
    { key: 'budget', header: 'Budget', align: 'right', render: (e) => `$${e.costBudget}` },
    { key: 'used', header: 'Used', align: 'right', render: (e) => `$${e.costUsed.toFixed(6)}` },
    { key: 'usedPercent', header: '%', align: 'right', render: (e) => `${e.costUsagePercent}%` },
    { key: 'tokens', header: 'Tokens', align: 'right', render: (e) => `${e.tokenBudget}` },
    { key: 'usedTokens', header: 'Used', align: 'right', render: (e) => `$${e.tokensUsed.toFixed(6)}` },
    { key: 'usedTokensPercent', header: '%', align: 'right', render: (e) => `${e.tokenUsagePercent}%` },
  ];
  return (
    <AdminTable<OpenAIUsage>
      label={label}
      data={data}
      columns={columns}
      loading={loading}
      currentPage={currentPage}
      totalPages={totalPages}
      hasMore={hasMore}
      onPageChange={onPageChange}
      onRefresh={onRefresh}
      emptyMessage="No OpenAI Usage found."
    />
  );
}