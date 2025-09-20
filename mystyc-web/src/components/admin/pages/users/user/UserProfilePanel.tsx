import { UserProfile } from 'mystyc-common/schemas/user-profile.schema';
import { formatDateForDisplay } from '@/util/dateTime';
import AdminPanelHeader from '@/components/admin/ui/AdminPanelHeader';
import Panel from '@/components/ui/Panel';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import UserProfileIcon from '@/components/admin/ui/icons/UserProfileIcon';
import Capsule from '@/components/ui/Capsule';
import { getZodiacIcon } from '@/components/ui/icons/astrology/zodiac';

export default function UserProfilePanel({ user }: { user?: UserProfile | null }) {
  return (
    <div className='flex flex-col space-y-1'>
      <AdminPanelHeader
        icon={UserProfileIcon}
        heading='Profile'
        tag={user?.astrology?.createdAt && (
            <Capsule
              label={user?.astrology?.sun.sign || "Astrology"}
              href={`/admin/users/${user?.firebaseUid}/astrology`}
              icon={getZodiacIcon(user?.astrology?.sun.sign, '!w-2 !h-2')}
            />
          )
        }
      />
      <AdminDetailGrid cols={2}>
        <Panel padding={4}>
          <AdminDetailField
            label="First Name"
            value={user && (user.firstName ? user.firstName : 'Not set')}
          />
        </Panel>
        <Panel padding={4}>
          <AdminDetailField
            label="Last Name"
            value={user && (user.lastName ? user.lastName : 'Not set')}
          />
        </Panel>
      </AdminDetailGrid>
      <AdminDetailGrid cols={4} className='!mt-4'>
        <Panel padding={4}>
          <AdminDetailGrid cols={1}>
            <AdminDetailField
              label="Date of Birth"
              value={user && (user.dateOfBirth ? formatDateForDisplay(user.dateOfBirth, false) : 'Not set')}
            />
            <AdminDetailField
              label="Time of Birth"
              value={user && (user.timeOfBirth ? user.timeOfBirth : 'Not set')}
            />
          </AdminDetailGrid>
        </Panel>
        <Panel padding={4}>
          <AdminDetailGrid cols={1}>
            <AdminDetailField
              label="Birth Location"
              value={user && (user.birthLocation ? user.birthLocation.name : 'Not set')}
            />
            <AdminDetailField
              label="Address"
              value={user && (user.birthLocation ? user.birthLocation.formattedAddress : 'Not set')}
            />
          </AdminDetailGrid>
        </Panel>
        <Panel padding={4}>
          <AdminDetailGrid cols={1}>
            <AdminDetailField
              label="Timezone"
              value={user && (user.birthLocation ? user.birthLocation.timezone.name : 'Not set')}
            />
            <AdminDetailField
              label="Timezone Offset"
              value={user && (user.birthLocation ? user.birthLocation.timezone.offsetHours.toFixed(2).toString() : 'Not set')}
            />
          </AdminDetailGrid>
        </Panel>
        <Panel padding={4}>
          <AdminDetailGrid cols={1}>
            <AdminDetailField
              label="Latitude"
              value={user && (user.birthLocation ? user.birthLocation.coordinates.lat : 'Not set')}
            />
            <AdminDetailField
              label="Longitude"
              value={user && (user.birthLocation ? user.birthLocation.coordinates.lng : 'Not set')}
            />
          </AdminDetailGrid>
        </Panel>
      </AdminDetailGrid>
    </div>
  );
}