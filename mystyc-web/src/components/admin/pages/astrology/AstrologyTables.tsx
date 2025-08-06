import { 
  PlanetaryPosition,
  ElementInteraction, 
  ModalityInteraction,
  PlanetInteraction
} from 'mystyc-common/schemas/';
import { Pagination } from 'mystyc-common/admin';
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

// Planetary Positions Table
interface PlanetaryPositionsTableProps {
  label?: string;
  data?: PlanetaryPosition[];
  pagination?: Pagination;
  loading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export function PlanetaryPositionsTable({
  label,
  data,
  pagination,
  loading,
  currentPage,
  onPageChange,
  onRefresh,
}: PlanetaryPositionsTableProps) {
  const columns: Column<PlanetaryPosition>[] = [
    { key: 'planet', header: 'Planet' },
    { key: 'sign', header: 'Sign' },
    { key: 'element', header: 'Element' },
    { key: 'modality', header: 'Modality' },
    { key: 'energyType', header: 'Energy Type' },
    { key: 'keywords', header: 'Keywords', render: (p) => p.keywords.slice(0, 3).join(', ') + (p.keywords.length > 3 ? '...' : '') },
  ];

  return (
    <AdminTable<PlanetaryPosition>
      label={label}
      data={data}
      columns={columns}
      loading={loading}
      currentPage={currentPage}
      totalPages={pagination?.totalPages}
      hasMore={pagination?.hasMore}
      onPageChange={onPageChange}
      onRefresh={onRefresh}
      emptyMessage="No Planetary Positions found."
    />
  );
}

// Element Interactions Table
interface ElementInteractionsTableProps {
  label?: string;
  data?: ElementInteraction[];
  pagination?: Pagination;
  loading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export function ElementInteractionsTable({
  label,
  data,
  pagination,
  loading,
  currentPage,
  onPageChange,
  onRefresh,
}: ElementInteractionsTableProps) {
  const columns: Column<ElementInteraction>[] = [
    { key: 'element1', header: 'Element 1' },
    { key: 'element2', header: 'Element 2' },
    { key: 'dynamic', header: 'Dynamic' },
    { key: 'energyType', header: 'Energy Type' },
    { key: 'keywords', header: 'Keywords', render: (e) => e.keywords.slice(0, 3).join(', ') + (e.keywords.length > 3 ? '...' : '') },
  ];

  return (
    <AdminTable<ElementInteraction>
      label={label}
      data={data}
      columns={columns}
      loading={loading}
      currentPage={currentPage}
      totalPages={pagination?.totalPages}
      hasMore={pagination?.hasMore}
      onPageChange={onPageChange}
      onRefresh={onRefresh}
      emptyMessage="No Element Interactions found."
    />
  );
}

// Modality Interactions Table
interface ModalityInteractionsTableProps {
  label?: string;
  data?: ModalityInteraction[];
  pagination?: Pagination;
  loading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export function ModalityInteractionsTable({
  label,
  data,
  pagination,
  loading,
  currentPage,
  onPageChange,
  onRefresh,
}: ModalityInteractionsTableProps) {
  const columns: Column<ModalityInteraction>[] = [
    { key: 'modality1', header: 'Modality 1' },
    { key: 'modality2', header: 'Modality 2' },
    { key: 'dynamic', header: 'Dynamic' },
    { key: 'energyType', header: 'Energy Type' },
    { key: 'keywords', header: 'Keywords', render: (m) => m.keywords.slice(0, 3).join(', ') + (m.keywords.length > 3 ? '...' : '') },
  ];

  return (
    <AdminTable<ModalityInteraction>
      label={label}
      data={data}
      columns={columns}
      loading={loading}
      currentPage={currentPage}
      totalPages={pagination?.totalPages}
      hasMore={pagination?.hasMore}
      onPageChange={onPageChange}
      onRefresh={onRefresh}
      emptyMessage="No Modality Interactions found."
    />
  );
}

// Planet Interactions Table
interface PlanetInteractionsTableProps {
  label?: string;
  data?: PlanetInteraction[];
  pagination?: Pagination;
  loading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export function PlanetInteractionsTable({
  label,
  data,
  pagination,
  loading,
  currentPage,
  onPageChange,
  onRefresh,
}: PlanetInteractionsTableProps) {
  const columns: Column<PlanetInteraction>[] = [
    { key: 'planet1', header: 'Planet 1' },
    { key: 'planet2', header: 'Planet 2' },
    { key: 'dynamic', header: 'Dynamic' },
    { key: 'energyType', header: 'Energy Type' },
    { key: 'keywords', header: 'Keywords', render: (p) => p.keywords.slice(0, 3).join(', ') + (p.keywords.length > 3 ? '...' : '') },
  ];

  return (
    <AdminTable<PlanetInteraction>
      label={label}
      data={data}
      columns={columns}
      loading={loading}
      currentPage={currentPage}
      totalPages={pagination?.totalPages}
      hasMore={pagination?.hasMore}
      onPageChange={onPageChange}
      onRefresh={onRefresh}
      emptyMessage="No Planet Interactions found."
    />
  );
}