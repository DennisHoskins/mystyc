import { Element } from 'mystyc-common/schemas';
import { Pagination } from 'mystyc-common/admin';
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

interface ElementsTableProps {
  elements?: Element[];
  pagination?: Pagination;
  currentPage: number;
  loadElements: (currentPage: number) => void
}

export default function ElementsTable({ elements, pagination, currentPage, loadElements }: ElementsTableProps) {
  const columns: Column<Element>[] = [
    { key: 'element', header: 'Element', link: (e) => `/admin/astrology/elements/${e.element}` },
    { key: 'energyType', header: 'energyType', link: (e) => `/admin/astrology/energy-types/${e.energyType}` },
    { key: 'keywords', header: 'Keywords', render: (e) => e.keywords.slice(0, 3).join(', ') + (e.keywords.length > 3 ? '...' : '') },
    { key: 'description', header: 'Description', render: (e) => e.description.length > 30 ? (e.description.substring(0, 30) + "...") : e.description },
  ];

  return (
    <AdminTable<Element>
      data={elements}
      columns={columns}
      loading={elements == null}
      currentPage={currentPage}
      totalPages={pagination?.totalPages}
      hasMore={pagination?.hasMore}
      onPageChange={loadElements}
      onRefresh={() => loadElements(currentPage)}
      emptyMessage="No elements found."
    />
  );
}