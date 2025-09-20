import { ModalityInteraction } from 'mystyc-common/schemas';
import { Pagination } from 'mystyc-common/admin';
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

interface ModalityInteractionsTableProps {
  modalityInteractions?: ModalityInteraction[];
  pagination?: Pagination;
  currentPage: number;
  loadModalityInteractions: (currentPage: number) => void
}

export default function ModalityInteractionsTable({ modalityInteractions, pagination, currentPage, loadModalityInteractions }: ModalityInteractionsTableProps) {
  const columns: Column<ModalityInteraction>[] = [
    { key: 'key', header: 'Key', 
      link: (m) => `/admin/astrology/modality-interactions/${m.modality1}-${m.modality2}`,
      render: (m) => `${m.modality1}-${m.modality2}`
    },
    { key: 'modality1', header: 'Modality 1', link: (m) => `/admin/astrology/modalities/${m.modality1}` },
    { key: 'modality2', header: 'Modality 2', link: (m) => `/admin/astrology/modalities/${m.modality2}` },
    { key: 'dynamic', header: 'Dynamic', link: (m) => `/admin/astrology/dynamics/${m.dynamic}` },
    { key: 'energyType', header: 'Energy Type', link: (m) => `/admin/astrology/energy-types/${m.energyType}` },
    { key: 'keywords', header: 'Keywords', render: (m) => m.keywords.slice(0, 3).join(', ') + (m.keywords.length > 3 ? '...' : '') },
  ];

  return (
    <AdminTable<ModalityInteraction>
      data={modalityInteractions}
      columns={columns}
      loading={modalityInteractions == null}
      currentPage={currentPage}
      totalPages={pagination?.totalPages}
      hasMore={pagination?.hasMore}
      onPageChange={loadModalityInteractions}
      onRefresh={() => loadModalityInteractions(currentPage)}
      emptyMessage="No Modality Interactions found."
    />
  );
}