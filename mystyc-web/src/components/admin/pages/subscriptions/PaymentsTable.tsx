import { useState, useEffect, useCallback } from 'react';
import { PaymentHistory } from 'mystyc-common/schemas/payment-history.schema';
import { AdminListResponse, BaseAdminQuery } from 'mystyc-common/admin';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import { formatDateForDisplay } from '@/util/dateTime';
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

type PaymentServerAction = (params: {deviceInfo: any} & BaseAdminQuery) => Promise<AdminListResponse<PaymentHistory>>;

interface PaymentsTableProps {
  serverAction?: PaymentServerAction;
  onRefresh?: () => void;
  hideUserColumn?: boolean;
  payments?: AdminListResponse<PaymentHistory> | null;
}

export default function PaymentsTable({
  serverAction,
  onRefresh,
  hideUserColumn = false,
  payments
}: PaymentsTableProps) {
  const { setBusy } = useBusy();
  const [data, setData] = useState<AdminListResponse<PaymentHistory> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadPayments = useCallback(async (page: number) => {
    if (!serverAction) {
      return;
    }
    try {
      setError(null);
      setBusy(1000);

      const listQuery = getDefaultListQuery(page);
      const response = await serverAction({deviceInfo: getDeviceInfo(), ...listQuery});

      setData(response);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load payments:', err);
      setError('Failed to load payments. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [serverAction, setBusy]);

  const handlePageChange = (page: number) => {
    loadPayments(page);
  };

  const handleRefresh = () => {
    loadPayments(0);
    if (onRefresh) {
      onRefresh();
    }
  };

  useEffect(() => {
    if (payments) {
      setData(payments);
      setCurrentPage(0);
      return;
    }
    loadPayments(0);
  }, [loadPayments, payments, setData]);

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

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  return (
    <AdminTable<PaymentHistory>
      data={data?.data}
      columns={columns}
      loading={data == null}
      currentPage={currentPage}
      totalPages={data?.pagination?.totalPages || 0}
      hasMore={data?.pagination?.hasMore || false}
      onPageChange={handlePageChange}
      onRefresh={handleRefresh}
      emptyMessage="No Payments found."
    />
  );
}