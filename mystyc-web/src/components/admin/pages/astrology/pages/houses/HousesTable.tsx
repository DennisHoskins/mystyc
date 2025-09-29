import { House } from 'mystyc-common/schemas';
import { Pagination } from 'mystyc-common/admin';
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

interface HousesTableProps {
  houses?: House[];
  pagination?: Pagination;
  currentPage: number;
  loadHouses: (currentPage: number) => void
}

export default function HousesTable({ houses, pagination, currentPage, loadHouses }: HousesTableProps) {
  const columns: Column<House>[] = [
    { key: 'houseNumber', header: 'Number', link: (p) => `/admin/astrology/houses/${p.houseNumber}` },
    { key: 'name', header: 'House', link: (p) => `/admin/astrology/houses/${p.houseNumber}` },
    { key: 'naturalRuler', header: 'Ruler', link: (p) => `/admin/astrology/signs/${p.naturalRuler}` },
    { key: 'lifeArea', header: 'Life Area', link: (p) => `/admin/astrology/houses/${p.houseNumber}` },
    { key: 'energyType', header: 'energyType', link: (p) => `/admin/astrology/energy-types/${p.energyType}` },
    { key: 'keywords', header: 'Keywords', render: (p) => p.keywords.slice(0, 3).join(', ') + (p.keywords.length > 3 ? '...' : '') },
    { key: 'description', header: 'Description', render: (p) => p.description.length > 30 ? (p.description.substring(0, 30) + "...") : p.description },
  ];

  return (
    <AdminTable<House>
      data={houses}
      columns={columns}
      loading={houses == null}
      currentPage={currentPage}
      totalPages={pagination?.totalPages}
      hasMore={pagination?.hasMore}
      onPageChange={loadHouses}
      onRefresh={() => loadHouses(currentPage)}
      emptyMessage="No houses found."
    />
  );
}