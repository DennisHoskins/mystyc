import { PlanetInteraction } from 'mystyc-common/schemas';
import { Pagination } from 'mystyc-common/admin';
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

interface PlanetInteractionsTableProps {
  planetInteractions?: PlanetInteraction[];
  pagination?: Pagination;
  currentPage?: number;
  loadPlanetInteractions: (currentPage: number) => void
}

export default function PlanetInteractionsTable({ planetInteractions, pagination, currentPage, loadPlanetInteractions }: PlanetInteractionsTableProps) {
  const columns: Column<PlanetInteraction>[] = [
    { key: 'ley', header: 'Key', 
      link: (p) => `/admin/astrology/planet-interactions/${p.planet1}-${p.planet2}`,
      render: (p) => `${p.planet1}-${p.planet2}`
    },
    { key: 'planet1', header: 'Planet 1', link: (p) => `/admin/astrology/planets/${p.planet1}` },
    { key: 'planet2', header: 'Planet 2', link: (p) => `/admin/astrology/planets/${p.planet2}` },
    { key: 'dynamic', header: 'Dynamic', link: (p) => `/admin/astrology/dynamics/${p.dynamic}` },
    { key: 'energyType', header: 'Energy Type', link: (p) => `/admin/astrology/energyTypes/${p.energyType}` },
    { key: 'keywords', header: 'Keywords', render: (p) => p.keywords.slice(0, 3).join(', ') + (p.keywords.length > 3 ? '...' : '') },
  ];

  return (
    <AdminTable<PlanetInteraction>
      data={planetInteractions}
      columns={columns}
      loading={planetInteractions == null}
      currentPage={currentPage}
      totalPages={pagination?.totalPages}
      hasMore={pagination?.hasMore}
      onPageChange={loadPlanetInteractions}
      onRefresh={() => loadPlanetInteractions(currentPage || 0)}
      emptyMessage="No Planet Interactions found."
    />
  );
}