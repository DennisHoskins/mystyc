import { UserProfile } from 'mystyc-common/schemas/user-profile.schema';
import { formatDateForDisplay } from '@/util/dateTime';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import SubscriptionsIcon from '@/components/admin/ui/icons/SubscriptionsIcon';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function UserSubscriptionPanel({ user }: { user?: UserProfile | null }) {

  return (
    <div className='flex flex-col'>
      <div className="flex items-center space-x-2 mb-4">
        <Avatar size={'small'} icon={SubscriptionsIcon} />
        <div>
          <Heading level={5}>Subscription</Heading>
        </div>
      </div>

      <hr/ >

      <AdminDetailGrid cols={1} className='mt-4'>
        <AdminDetailField
          label="Subscription Level"
          value={user?.subscription.level}
        />
        <AdminDetailField
          label="Stripe Customer Id"
          value={user?.stripeCustomerId}
        />
        <AdminDetailField
          label="Start Date"
          value={user && user.subscription.startDate ? formatDateForDisplay(user.subscription.startDate) : ""}
        />
        <AdminDetailField
          label="Credit Balance"
          value={user ? user.subscription.creditBalance || "0" : ""}
        />
      </AdminDetailGrid>
    </div>
  );
}