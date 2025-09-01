import { PolarityInteraction } from 'mystyc-common/schemas';
import { Pagination } from 'mystyc-common/admin';
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

interface PolarityInteractionsTableProps {
  polarityInteractions?: PolarityInteraction[];
  pagination?: Pagination;
  currentPage: number;
  loadPolarityInteractions: (currentPage: number) => void
}

export default function PolarityInteractionsTable({ polarityInteractions, pagination, currentPage, loadPolarityInteractions }: PolarityInteractionsTableProps) {
  const columns: Column<PolarityInteraction>[] = [
    { key: 'key', header: 'Key', 
      link: (m) => `/admin/astrology/polarity-interactions/${m.polarity1}-${m.polarity2}`,
      render: (m) => `${m.polarity1}-${m.polarity2}`
    },
    { key: 'polarity1', header: 'Polarity 1', link: (m) => `/admin/astrology/modalities/${m.polarity1}` },
    { key: 'polarity2', header: 'Polarity 2', link: (m) => `/admin/astrology/modalities/${m.polarity2}` },
    { key: 'dynamic', header: 'Dynamic', link: (m) => `/admin/astrology/dynamics/${m.dynamic}` },
    { key: 'energyType', header: 'Energy Type', link: (m) => `/admin/astrology/energy-types/${m.energyType}` },
    { key: 'keywords', header: 'Keywords', render: (m) => m.keywords.slice(0, 3).join(', ') + (m.keywords.length > 3 ? '...' : '') },
  ];

  return (
    <AdminTable<PolarityInteraction>
      data={polarityInteractions}
      columns={columns}
      loading={polarityInteractions == null}
      currentPage={currentPage}
      totalPages={pagination?.totalPages}
      hasMore={pagination?.hasMore}
      onPageChange={loadPolarityInteractions}
      onRefresh={() => loadPolarityInteractions(currentPage)}
      emptyMessage="No Polarity Interactions found."
    />
  );
}