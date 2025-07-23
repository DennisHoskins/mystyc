import { PaymentHistory } from 'mystyc-common/schemas/payment-history.schema';

import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import AdminDetailGroup from '@/components/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import StripeIcon from '@/components/admin/ui/icons/StripeIcon';

export default function SubscriptionStripeCard({ payment }: { payment: PaymentHistory }) {
  if (!payment) {
    return (
      <div className='flex flex-col'>
        <div className="flex items-center space-x-2 mb-4">
          <Avatar size={'small'} icon={StripeIcon} />
          <Heading level={5} className='flex-1'>Stripe Details</Heading>
        </div>

        <hr />

        <div className="pt-4">
          <AdminDetailGroup>
            <AdminDetailField
              label="Stripe Id"
              value={'Not set'}
            />
          </AdminDetailGroup>
        </div>
      </div>
    )
  }
  
  return (
    <Card className='flex flex-col'>
      <div className="flex items-center space-x-2 mb-4">
        <Avatar size={'small'} icon={StripeIcon} />
        <Heading level={5} className='flex-1'>Stripe Details</Heading>
      </div>

      <hr />

      <div className="pt-4">
        <AdminDetailGroup className='grid grid-cols-1 md:grid-cols-2'>
          <AdminDetailField
            label="Invoice Id"
            value={payment.stripeInvoiceId}
          />
          <AdminDetailField
            label="Subscription Id"
            value={payment.stripeSubscriptionId}
          />
          <AdminDetailField
            label="Charge Id"
            value={payment.stripeChargeId}
          />
          <AdminDetailField
            label="Customer Id"
            value={payment.stripeCustomerId}
          />
        </AdminDetailGroup>
      </div>
    </Card>
  );
}