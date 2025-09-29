import { PaymentHistory } from 'mystyc-common/schemas/payment-history.schema';
import AdminPanelHeader from '@/components/admin/ui/AdminPanelHeader';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import StripeIcon from '@/components/admin/ui/icons/StripeIcon';

export default function SubscriptionStripeCard({ payment }: { payment?: PaymentHistory | null }) {
  return (
    <div className='flex flex-col space-y-1'>
      <AdminPanelHeader
        icon={StripeIcon}
        heading='Stripe Details'
      />
      <AdminDetailGrid>
        <AdminDetailField
          label="Invoice Id"
          value={payment?.stripeInvoiceId}
        />
        <AdminDetailField
          label="Subscription Id"
          value={payment?.stripeSubscriptionId}
        />
        <AdminDetailField
          label="Charge Id"
          value={payment?.stripeChargeId}
        />
        <AdminDetailField
          label="Customer Id"
          value={payment?.stripeCustomerId}
        />
      </AdminDetailGrid>
    </div>
  );
}