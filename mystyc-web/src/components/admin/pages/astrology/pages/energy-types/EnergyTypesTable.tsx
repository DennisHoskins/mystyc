import { EnergyType } from 'mystyc-common/schemas';
import { Pagination } from 'mystyc-common/admin';
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

interface EnergyTypesTableProps {
  energyTypes?: EnergyType[];
  pagination?: Pagination;
  currentPage: number;
  loadEnergyTypes: (currentPage: number) => void
}

export default function EnergyTypesTable({ energyTypes, pagination, currentPage, loadEnergyTypes }: EnergyTypesTableProps) {
  const columns: Column<EnergyType>[] = [
    { key: 'energyType', header: 'Type', link: (e) => `/admin/astrology/energy-types/${e.energyType}` },
    { key: 'category', header: 'Category' },
    { key: 'intensity', header: 'Intensity', align: 'right' },
    { key: 'keywords', header: 'Keywords', render: (e) => e.keywords.slice(0, 3).join(', ') + (e.keywords.length > 3 ? '...' : '') },
    { key: 'description', header: 'Description', render: (e) => e.description.length > 30 ? (e.description.substring(0, 30) + "...") : e.description },
  ];

  return (
    <AdminTable<EnergyType>
      data={energyTypes}
      columns={columns}
      loading={energyTypes == null}
      currentPage={currentPage}
      totalPages={pagination?.totalPages}
      hasMore={pagination?.hasMore}
      onPageChange={loadEnergyTypes}
      onRefresh={() => loadEnergyTypes(currentPage)}
      emptyMessage="No dynamics found."
    />
  );
}