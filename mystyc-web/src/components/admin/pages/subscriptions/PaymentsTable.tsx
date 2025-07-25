import { PaymentHistory } from 'mystyc-common/schemas/payment-history.schema';
import { Pagination } from 'mystyc-common/admin';

import { formatDateForDisplay } from '@/util/dateTime';

import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

interface PaymentsTableProps {
  label?: string;
  data?: PaymentHistory[];
  pagination?: Pagination;
  loading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  hideUserColumn?: false;
}

export default function PaymentsTable({
  label,
  data,
  pagination,
  loading,
  currentPage,
  onPageChange,
  onRefresh,
  hideUserColumn = false
}: PaymentsTableProps) {
  const baseColumns: Column<PaymentHistory>[] = [
    { key: 'datePaid', header: 'Date Paid', link: (e) => `/admin/subscriptions/${e._id}`, render: (e) => formatDateForDisplay(e.paidAt) },
    { key: 'amount', header: 'Amount', align: "right", link: (e) => `/admin/subscriptions/${e._id}`, render: (e) => "$" +  (e.amount / 100).toFixed(2) + " " + e.currency },
    { key: 'invoiceId', header: 'Invoice Id', link: (e) => `/admin/subscriptions/${e._id}`, render: (e) => e.stripeInvoiceId },
  ];

  const userColumn: Column<PaymentHistory> = {
    key: 'userName', 
    header: 'User', 
    link: (e) => `/admin/users/${e.firebaseUid}`,
    render: (e) => e.firebaseUid || 'Unknown User'
  };

  const columns = hideUserColumn 
    ? baseColumns 
    : [
        ...baseColumns,
        userColumn
      ];

  return (
    <AdminTable<PaymentHistory>
      label={label}
      data={data}
      columns={columns}
      loading={loading}
      currentPage={currentPage}
      totalPages={pagination?.totalPages}
      hasMore={pagination?.hasMore}
      onPageChange={onPageChange}
      onRefresh={onRefresh}
      emptyMessage="No Payments found."
    />
  );
}