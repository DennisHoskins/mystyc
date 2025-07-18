'use client';

import { UserProfile } from '@/interfaces';
import { formatDateForDisplay } from '@/util/dateTime';

import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import AdminDetailGroup from '@/components/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import UserProfileIcon from '@/components/admin/ui/icons/UserProfileIcon';

export default function UserProfilePanel({ user }: { user?: UserProfile | null }) {
  if (!user) {
    return;
  }

  return (
    <div className='flex flex-col'>
      <div className="flex items-center space-x-2 mb-4">
        <Avatar size={'small'} icon={UserProfileIcon} />
        <div>
          <Heading level={5}>Profile</Heading>
        </div>
      </div>

      <hr/ >

      <div className='pt-4'>
        <AdminDetailGroup>
          <AdminDetailField
            label="Full Name"
            value={user.fullName || 'Not set'}
          />
        </AdminDetailGroup>

        <div className='pt-4'>
          <AdminDetailGrid>
            <AdminDetailGroup>
              <AdminDetailField
                label="Date of Birth"
                value={user.dateOfBirth ? formatDateForDisplay(user.dateOfBirth) : 'Not set'}
              />
            </AdminDetailGroup>
            <AdminDetailGroup>
              <AdminDetailField
                label="Time of Birth"
                value={user.dateOfBirth ? formatDateForDisplay(user.dateOfBirth) : 'Not set'}
              />
            </AdminDetailGroup>
            <AdminDetailGroup>
              <AdminDetailField
                label="Zodiac Sign"
                value={user.zodiacSign || 'Not set'}
              />
            </AdminDetailGroup>
          </AdminDetailGrid>
        </div>
      </div>
    </div>
  );
}