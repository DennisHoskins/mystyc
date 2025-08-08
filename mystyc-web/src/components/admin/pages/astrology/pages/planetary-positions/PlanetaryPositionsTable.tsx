import { PlanetaryPosition } from 'mystyc-common/schemas';
import { Pagination } from 'mystyc-common/admin';
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

interface PlanetaryPositionsTableProps {
  planetaryPositions?: PlanetaryPosition[];
  pagination?: Pagination;
  currentPage?: number;
  loadPlanetaryPositions: (currentPage: number) => void
}

export default function PlanetaryPositionsTable({ planetaryPositions, pagination, currentPage, loadPlanetaryPositions }: PlanetaryPositionsTableProps) {
  const columns: Column<PlanetaryPosition>[] = [
    { key: 'planet', header: 'Planet', link: (p) => `/admin/astrology/planets/${p.planet}` },
    { key: 'sign', header: 'Sign', link: (p) => `/admin/astrology/signs/${p.sign}` },
    { key: 'energyType', header: 'Energy Type', link: (p) => `/admin/astrology/energyTypes/${p.energyType}` },
    { key: 'keywords', header: 'Keywords', render: (p) => p.keywords.slice(0, 3).join(', ') + (p.keywords.length > 3 ? '...' : '') },
  ];

  return (
    <AdminTable<PlanetaryPosition>
      data={planetaryPositions}
      columns={columns}
      loading={planetaryPositions == null}
      currentPage={currentPage}
      totalPages={pagination?.totalPages}
      hasMore={pagination?.hasMore}
      onPageChange={loadPlanetaryPositions}
      onRefresh={() => loadPlanetaryPositions(currentPage || 0)}
      emptyMessage="No Planetary Positions found."
    />
  );
}