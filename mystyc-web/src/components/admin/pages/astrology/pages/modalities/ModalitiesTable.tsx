import { Modality } from 'mystyc-common/schemas';
import { Pagination } from 'mystyc-common/admin';
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

interface ModalitiesTableProps {
  modalities?: Modality[];
  pagination?: Pagination;
  currentPage: number;
  loadModalities: (currentPage: number) => void
}

export default function ModalitiesTable({ modalities, pagination, currentPage, loadModalities }: ModalitiesTableProps) {
  const columns: Column<Modality>[] = [
    { key: 'modality', header: 'Modality', link: (m) => `/admin/astrology/modalities/${m.modality}` },
    { key: 'energyType', header: 'energyType', link: (m) => `/admin/astrology/energy-types/${m.energyType}` },
    { key: 'keywords', header: 'Keywords', render: (m) => m.keywords.slice(0, 3).join(', ') + (m.keywords.length > 3 ? '...' : '') },
    { key: 'description', header: 'Description', render: (m) => m.description.length > 30 ? (m.description.substring(0, 30) + "...") : m.description },
  ];

  return (
    <AdminTable<Modality>
      data={modalities}
      columns={columns}
      loading={modalities == null}
      currentPage={currentPage}
      totalPages={pagination?.totalPages}
      hasMore={pagination?.hasMore}
      onPageChange={loadModalities}
      onRefresh={() => loadModalities(currentPage)}
      emptyMessage="No modalities found."
    />
  );
}