import { UserProfile } from 'mystyc-common/schemas/user-profile.schema';
import { formatDateForDisplay } from '@/util/dateTime';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import UserProfileIcon from '@/components/admin/ui/icons/UserProfileIcon';

export default function UserProfileCard({ user }: { user?: UserProfile | null }) {

console.log(user)

  return (
    <Card className='flex flex-col'>
      <div className="flex items-center space-x-2 mb-4">
        <Avatar size={'small'} icon={UserProfileIcon} />
        <div>
          <Heading level={5}>Profile</Heading>
        </div>
      </div>

      <hr/ >

      <AdminDetailGrid cols={3} className='mt-4'>
        <AdminDetailField
          label="First Name"
          value={user && (user.firstName ? user.firstName : 'Not set')}
        />
        <AdminDetailField
          label="Last Name"
          value={user && (user.lastName ? user.lastName : 'Not set')}
        />
        <AdminDetailField
          label="Date of Birth"
          value={user && (user.dateOfBirth ? formatDateForDisplay(user.dateOfBirth, false) : 'Not set')}
        />
        <AdminDetailField
          label="Time of Birth"
          value={user && (user.timeOfBirth ? user.timeOfBirth : 'Not set')}
        />
        <AdminDetailField
          label="Birth Timezone"
          value={user && (user.birthLocation ? user.birthLocation.timezone.name : 'Not set')}
        />
        <AdminDetailField
          label="Birth Location"
          value={user && (user.birthLocation ? user.birthLocation.name : 'Not set')}
        />
      </AdminDetailGrid>
    </Card>
  );
}