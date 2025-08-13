import { UserProfile } from 'mystyc-common/schemas/user-profile.schema';
import { formatDateForDisplay } from '@/util/dateTime';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Link from '@/components/ui/Link';
import Heading from '@/components/ui/Heading';
import SubscriptionsIcon from '@/components/admin/ui/icons/SubscriptionsIcon';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import Capsule from '@/components/ui/Capsule';
import { DollarSign } from 'lucide-react';

export default function UserSubscriptionCard({ user }: { user?: UserProfile | null }) {
  return (
    <Card className='flex flex-col space-y-2'>
      <div className="flex items-center space-x-2">
        <Avatar size={'small'} icon={SubscriptionsIcon} />
        <Link href={`/admin/users/${user?.firebaseUid}/subscription`} className='flex-1'>
          <Heading level={4} className='flex-1'>Subscription</Heading>
        </Link>
        <Capsule 
          label="Payments"
          href={`/admin/users/${user?.firebaseUid}/payments`}
          icon={<DollarSign className='w-3 h-3' />}
        />
      </div>
      <hr/ >
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
    </Card>
  );
}