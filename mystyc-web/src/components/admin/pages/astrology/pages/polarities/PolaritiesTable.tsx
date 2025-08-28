import { Polarity } from 'mystyc-common/schemas';
import { Pagination } from 'mystyc-common/admin';
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

interface PolaritiesTableProps {
  polarities?: Polarity[];
  pagination?: Pagination;
  currentPage: number;
  loadPolarities: (currentPage: number) => void
}

export default function PolaritiesTable({ polarities, pagination, currentPage, loadPolarities }: PolaritiesTableProps) {
  const columns: Column<Polarity>[] = [
    { key: 'polarity', header: 'Polarity', link: (p) => `/admin/astrology/polarities/${p.polarity}` },
    { key: 'alternativeName', header: 'Alt Name', link: (p) => `/admin/astrology/polarities/${p.alternativeName}` },
    { key: 'energyType', header: 'energyType', link: (p) => `/admin/astrology/energy-types/${p.energyType}` },
    { key: 'keywords', header: 'Keywords', render: (p) => p.keywords.slice(0, 3).join(', ') + (p.keywords.length > 3 ? '...' : '') },
    { key: 'description', header: 'Description', render: (p) => p.description.length > 30 ? (p.description.substring(0, 30) + "...") : p.description },
  ];

  return (
    <AdminTable<Polarity>
      data={polarities}
      columns={columns}
      loading={polarities == null}
      currentPage={currentPage}
      totalPages={pagination?.totalPages}
      hasMore={pagination?.hasMore}
      onPageChange={loadPolarities}
      onRefresh={() => loadPolarities(currentPage)}
      emptyMessage="No polarities found."
    />
  );
}