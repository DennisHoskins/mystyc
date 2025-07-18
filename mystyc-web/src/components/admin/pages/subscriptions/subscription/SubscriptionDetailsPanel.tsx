'use client';

import { PaymentHistory } from '@/interfaces';
import { formatDateForDisplay } from '@/util/dateTime';

import AdminDetailGroup from '@/components/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function SubscriptionDetailsPanel({ payment }: { payment?: PaymentHistory | null }) {
  if (!payment) {
    return;
  }

  return (
    <AdminDetailGroup className="grid grid-cols-1 md:grid-cols-2">
      <AdminDetailField
        label="Tier"
        value={payment.subscriptionTier}
      />
      <AdminDetailField
        label="Amount"
        value={'$' +  (payment.amount / 100).toFixed(2) + " " + payment.currency}
      />
      <AdminDetailField
        label="Status"
        value={payment.status}
      />
      <AdminDetailField
        label="Date Paid"
        value={formatDateForDisplay(payment.paidAt)}
      />
      <AdminDetailField
        label="Start Period"
        value={formatDateForDisplay(payment.periodStart)}
      />
      <AdminDetailField
        label="End Period"
        value={formatDateForDisplay(payment.periodEnd)}
      />
    </AdminDetailGroup>
  );
}