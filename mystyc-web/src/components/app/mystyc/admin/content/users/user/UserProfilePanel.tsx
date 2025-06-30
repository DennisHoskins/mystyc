'use client';

import { UserProfile } from '@/interfaces';
import { formatDateForDisplay } from '@/util/dateTime';
import Heading from '@/components/ui/Heading';
import AdminDetailGroup from '@/components/app/mystyc/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/app/mystyc/admin/ui/detail/AdminDetailField';
import AdminDetailGrid from '../../../ui/detail/AdminDetailGrid';

export default function UserProfilePanel({ user }: { user?: UserProfile | null }) {
  if (!user) {
    return;
  }

  return (
    <div className="space-y-6">
      <Heading level={5}>User Profile</Heading>
      <AdminDetailGrid>
        <AdminDetailGroup>
          <AdminDetailField
            label="Full Name"
            value={user.fullName || "-"}
          />
          <AdminDetailField
            label="Date of Birth"
            value={user.dateOfBirth ? formatDateForDisplay(user.dateOfBirth) : "-"}
          />
          <AdminDetailField
            label="Zodiac Sign"
            value={user.zodiacSign || "-"}
          />
        </AdminDetailGroup>
      </AdminDetailGrid>
    </div>
  );
}