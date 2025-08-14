import { UserProfile } from 'mystyc-common/schemas/user-profile.schema';
import { formatDateForDisplay } from '@/util/dateTime';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import UserProfileIcon from '@/components/admin/ui/icons/UserProfileIcon';
import Link from '@/components/ui/Link';
import Capsule from '@/components/ui/Capsule';
import { getZodiacIcon } from '@/components/ui/icons/astrology/zodiac';

export default function UserProfilePanel({ user }: { user?: UserProfile | null }) {
  return (
    <div className='flex flex-col space-y-1'>
      <div className="flex items-center space-x-2">
        <Avatar size={'small'} icon={UserProfileIcon} />
        <Link href={`/admin/users/${user?.firebaseUid}/astrology`} className='flex-1'>
          <Heading level={4}>Profile</Heading>
        </Link>
        <Capsule
          label={user?.astrology?.sunSign || "Astrology"}
          href={`/admin/users/${user?.firebaseUid}/astrology`}
          icon={getZodiacIcon(user?.astrology?.sunSign)}
        />
      </div>
      <hr/ >
      <AdminDetailGrid cols={3} className='pt-1'>
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
    </div>
  );
}