import { PaymentHistory } from 'mystyc-common/schemas/payment-history.schema';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import StripeIcon from '@/components/admin/ui/icons/StripeIcon';

export default function SubscriptionStripeCard({ payment }: { payment?: PaymentHistory | null }) {
  return (
    <div className='flex flex-col'>
      <div className="flex items-center space-x-2 mb-4">
        <Avatar size={'small'} icon={StripeIcon} />
        <Heading level={5} className='flex-1'>Stripe Details</Heading>
      </div>

      <hr />

      <AdminDetailGrid cols={1} className='mt-4'>
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