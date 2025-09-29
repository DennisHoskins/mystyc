import { Planet } from 'mystyc-common/schemas';
import { Pagination } from 'mystyc-common/admin';
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

interface PlanetsTableProps {
  planets?: Planet[];
  pagination?: Pagination;
  currentPage: number;
  loadPlanets: (currentPage: number) => void
}

export default function PlanetsTable({ planets, pagination, currentPage, loadPlanets }: PlanetsTableProps) {
  const columns: Column<Planet>[] = [
    { key: 'planet', header: 'Planet', link: (p) => `/admin/astrology/planets/${p.planet}` },
    { key: 'energyType', header: 'energyType', link: (p) => `/admin/astrology/energy-types/${p.energyType}` },
    { key: 'importance', header: 'Importance', align: 'right' },
    { key: 'keywords', header: 'Keywords', render: (p) => p.keywords.slice(0, 3).join(', ') + (p.keywords.length > 3 ? '...' : '') },
    { key: 'description', header: 'Description', render: (p) => p.description.length > 30 ? (p.description.substring(0, 30) + "...") : p.description },
  ];

  return (
    <AdminTable<Planet>
      data={planets}
      columns={columns}
      loading={planets == null}
      currentPage={currentPage}
      totalPages={pagination?.totalPages}
      hasMore={pagination?.hasMore}
      onPageChange={loadPlanets}
      onRefresh={() => loadPlanets(currentPage)}
      emptyMessage="No planets found."
    />
  );
}