'use client';

import { PaymentHistory } from '@/interfaces';
import { formatDateForDisplay } from '@/util/dateTime';

import AdminTable, { Column } from '@/components/admin/ui/AdminTable';

interface PaymentsTableProps {
  label?: string;
  data: PaymentHistory[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  hideUserColumn?: false;
}

export default function PaymentsTable({
  label,
  data,
  loading,
  currentPage,
  totalPages,
  hasMore,
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
      totalPages={totalPages}
      hasMore={hasMore}
      onPageChange={onPageChange}
      onRefresh={onRefresh}
      emptyMessage="No Payments found."
    />
  );
}