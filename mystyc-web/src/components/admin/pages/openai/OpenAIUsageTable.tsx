import { OpenAIUsage } from 'mystyc-common/schemas';
import { Pagination } from 'mystyc-common/admin';
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

interface OpenAIUsageTableProps {
  data?: OpenAIUsage[];
  pagination?: Pagination;
  currentPage: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export default function OpenAIUsageTable({
  data,
  pagination,
  currentPage,
  onPageChange,
  onRefresh,
}: OpenAIUsageTableProps) {
  const columns: Column<OpenAIUsage>[] = [
    { key: 'month', header: 'Month' },
    { key: 'budget', header: 'Budget', align: 'right', render: (e) => `$${e.costBudget}` },
    { key: 'used', header: 'Used', align: 'right', render: (e) => `$${e.costUsed.toFixed(6)}` },
    { key: 'usedPercent', header: '%', align: 'right', render: (e) => `${e.costUsagePercent}%` },
    { key: 'tokens', header: 'Tokens', align: 'right', render: (e) => `${e.tokenBudget}` },
    { key: 'usedTokens', header: 'Used', align: 'right', render: (e) => `${e.tokensUsed}` },
    { key: 'usedTokensPercent', header: '%', align: 'right', render: (e) => `${e.tokenUsagePercent}%` },
    { key: 'totalRequests', header: 'Requests', align: 'right', render: (e) => `${e.totalRequests}` },
  ];
  return (
    <AdminTable<OpenAIUsage>
      data={data}
      columns={columns}
      loading={data == null}
      currentPage={currentPage}
      totalPages={pagination?.totalPages}
      hasMore={pagination?.hasMore}
      onPageChange={onPageChange}
      onRefresh={onRefresh}
      emptyMessage="No OpenAI Usage found."
    />
  );
}