import { UserProfile } from 'mystyc-common/schemas/user-profile.schema';
import { formatDateForDisplay } from '@/util/dateTime';
import AdminCard from '@/components/admin/ui/AdminCard';
import SubscriptionsIcon from '@/components/admin/ui/icons/SubscriptionsIcon';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import Capsule from '@/components/ui/Capsule';
import { DollarSign } from 'lucide-react';

export default function UserSubscriptionCard({ user }: { user?: UserProfile | null }) {
  if (!user?.stripeCustomerId) {
    return null;
  }

  return (
    <AdminCard
      icon={<SubscriptionsIcon />}
      title='Subscription'
      href={`/admin/users/${user?.firebaseUid}/subscription`}
      tag={
        <Capsule 
          label="Payments"
          href={`/admin/users/${user?.firebaseUid}/payments`}
          icon={<DollarSign className='w-3 h-3' />}
        />
      }
    >
      <AdminDetailGrid cols={2}>
        <AdminDetailField
          label="Subscription Level"
          value={user?.subscription.level}
        />
        <AdminDetailField
          label="Stripe Customer Id"
          value={user?.stripeCustomerId || "-"}
        />
        <AdminDetailField
          label="Start Date"
          value={user && user.subscription.startDate ? formatDateForDisplay(user.subscription.startDate) : "-"}
        />
        <AdminDetailField
          label="Credit Balance"
          value={user ? user.subscription.creditBalance || "0" : ""}
        />
      </AdminDetailGrid>
    </AdminCard>
  );
}