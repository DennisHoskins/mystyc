import { PaymentHistory } from 'mystyc-common/schemas/payment-history.schema';
import { formatDateForDisplay } from '@/util/dateTime';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function SubscriptionDetailsPanel({ payment }: { payment?: PaymentHistory | null }) {
  return (
    <AdminDetailGrid cols={2}>
      <AdminDetailField
        label="Tier"
        value={payment?.subscriptionTier}
      />
      <AdminDetailField
        label="Amount"
        value={payment && ('$' +  (payment.amount / 100).toFixed(2) + " " + payment.currency)}
      />
      <AdminDetailField
        label="Status"
        value={payment?.status}
      />
      <AdminDetailField
        label="Date Paid"
        value={payment && formatDateForDisplay(payment.paidAt)}
      />
      <AdminDetailField
        label="Created"
        value={payment && formatDateForDisplay(payment.createdAt)}
      />
      <AdminDetailField
        label="Updated"
        value={payment && formatDateForDisplay(payment.updatedAt)}
      />
      <AdminDetailField
        label="Start Period"
        value={payment && formatDateForDisplay(payment.periodStart)}
      />
      <AdminDetailField
        label="End Period"
        value={payment && formatDateForDisplay(payment.periodEnd)}
      />
    </AdminDetailGrid>
  );
}