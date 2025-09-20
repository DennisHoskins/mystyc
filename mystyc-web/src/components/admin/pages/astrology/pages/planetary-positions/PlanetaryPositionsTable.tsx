import { PlanetaryPosition } from 'mystyc-common/schemas';
import { Pagination } from 'mystyc-common/admin';
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

interface PlanetaryPositionsTableProps {
  planetaryPositions?: PlanetaryPosition[];
  pagination?: Pagination;
  currentPage?: number;
  loadPlanetaryPositions: (currentPage: number) => void
  hideSignColumn?: boolean;
  hidePlanetColumn?: boolean;
}

export default function PlanetaryPositionsTable({ planetaryPositions, pagination, currentPage, loadPlanetaryPositions, hideSignColumn = false, hidePlanetColumn = false }: PlanetaryPositionsTableProps) {
  const allColumns: Column<PlanetaryPosition>[] = [
    { key: 'planet-sign', header: 'Key', 
      link: (p) => `/admin/astrology/planetary-positions/${p.planet}-${p.sign}`,
      render: (p) => `${p.planet}-${p.sign}`
    },
    { key: 'planet', header: 'Planet', link: (p) => `/admin/astrology/planets/${p.planet}` },
    { key: 'sign', header: 'Sign', link: (p) => `/admin/astrology/signs/${p.sign}` },
    { key: 'energyType', header: 'Energy Type', link: (p) => `/admin/astrology/energyTypes/${p.energyType}` },
    { key: 'keywords', header: 'Keywords', render: (p) => p.keywords.slice(0, 3).join(', ') + (p.keywords.length > 3 ? '...' : '') },
  ];

  let columns = hidePlanetColumn 
    ? allColumns.filter(column => column.key !== 'planet')
    : allColumns;

  columns = hideSignColumn 
    ? columns.filter(column => column.key !== 'sign')
    : columns;

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