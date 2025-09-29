import { Sign } from 'mystyc-common/schemas';
import { Pagination } from 'mystyc-common/admin';
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

interface SignsTableProps {
  signs?: Sign[];
  pagination?: Pagination;
  currentPage: number;
  loadSigns: (currentPage: number) => void
}

export default function SignsTable({ signs, pagination, currentPage, loadSigns }: SignsTableProps) {
  const columns: Column<Sign>[] = [
    { key: 'sign', header: 'Sign', link: (s) => `/admin/astrology/signs/${s.sign}` },
    { key: 'element', header: 'Element', link: (s) => `/admin/astrology/elements/${s.element}` },
    { key: 'modality', header: 'Modality', link: (s) => `/admin/astrology/modalities/${s.modality}` },
    { key: 'energyType', header: 'energyType', link: (s) => `/admin/astrology/energy-types/${s.energyType}` },
    { key: 'keywords', header: 'Keywords', render: (s) => s.keywords.slice(0, 3).join(', ') + (s.keywords.length > 3 ? '...' : '') },
    { key: 'description', header: 'Description', render: (s) => s.description.length > 30 ? (s.description.substring(0, 30) + "...") : s.description },
  ];

  return (
    <AdminTable<Sign>
      data={signs}
      columns={columns}
      loading={signs == null}
      currentPage={currentPage || 0}
      totalPages={pagination?.totalPages}
      hasMore={pagination?.hasMore}
      onPageChange={loadSigns}
      onRefresh={() => loadSigns(currentPage)}
      emptyMessage="No signs found."
    />
  );
}