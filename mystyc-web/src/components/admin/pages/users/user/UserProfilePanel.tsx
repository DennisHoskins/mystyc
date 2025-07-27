import { UserProfile } from 'mystyc-common/schemas/user-profile.schema';
import { formatDateForDisplay } from '@/util/dateTime';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import AdminDetailGroup from '@/components/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import UserProfileIcon from '@/components/admin/ui/icons/UserProfileIcon';

export default function UserProfilePanel({ user }: { user?: UserProfile | null }) {
  return (
    <div className='flex flex-col'>
      <div className="flex items-center space-x-2 mb-4">
        <Avatar size={'small'} icon={UserProfileIcon} />
        <div>
          <Heading level={5}>Profile</Heading>
        </div>
      </div>

      <hr/ >

      <AdminDetailGroup cols={1} className='mt-4'>
        <AdminDetailField
          label="Full Name"
          value={user && (user.fullName || 'Not set')}
        />
        <AdminDetailField
          label="Date of Birth"
          value={user && (user.dateOfBirth ? formatDateForDisplay(user.dateOfBirth) : 'Not set')}
        />
        <AdminDetailField
          label="Time of Birth"
          value={user && (user.dateOfBirth ? formatDateForDisplay(user.dateOfBirth) : 'Not set')}
        />
        <AdminDetailField
          label="Zodiac Sign"
          value={user && (user.zodiacSign || 'Not set')}
        />
      </AdminDetailGroup>
    </div>
  );
}