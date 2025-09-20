import { ElementInteraction } from 'mystyc-common/schemas';
import { Pagination } from 'mystyc-common/admin';
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

interface ElementInteractionsTableProps {
  elementInteractions?: ElementInteraction[];
  pagination?: Pagination;
  currentPage: number;
  loadElementInteractions: (currentPage: number) => void
}

export default function ElementInteractionsTable({ elementInteractions, pagination, currentPage, loadElementInteractions }: ElementInteractionsTableProps) {
  const columns: Column<ElementInteraction>[] = [
    { key: 'element1-element2', header: 'Key', 
      link: (e) => `/admin/astrology/element-interactions/${e.element1}-${e.element2}`,
      render: (e) => `${e.element1}-${e.element2}`
    },
    { key: 'element1', header: 'Element 1', link: (e) => `/admin/astrology/elements/${e.element1}` },
    { key: 'element2', header: 'Element 2', link: (e) => `/admin/astrology/elements/${e.element2}` },
    { key: 'dynamic', header: 'Dynamic', link: (e) => `/admin/astrology/dynamics/${e.dynamic}` },
    { key: 'energyType', header: 'Energy Type', link: (e) => `/admin/astrology/energyTypes/${e.energyType}` },
    { key: 'keywords', header: 'Keywords', render: (e) => e.keywords.slice(0, 3).join(', ') + (e.keywords.length > 3 ? '...' : '') },
  ];

  return (
    <AdminTable<ElementInteraction>
      data={elementInteractions}
      columns={columns}
      loading={elementInteractions == null}
      currentPage={currentPage}
      totalPages={pagination?.totalPages}
      hasMore={pagination?.hasMore}
      onPageChange={loadElementInteractions}
      onRefresh={() => loadElementInteractions(currentPage)}
      emptyMessage="No Element Interactions found."
    />
  );
}