'use client';

import { UserProfile } from '@/interfaces';
import { formatDateForDisplay } from '@/util/dateTime';
import AdminDetailGroup from '@/components/app/mystyc/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/app/mystyc/admin/ui/detail/AdminDetailField';
import Text from '@/components/ui/Text';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';

interface UserDetailsPanelProps {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export default function UserDetailsPanel({ 
  user, 
  loading, 
  error,
  onRetry 
}: UserDetailsPanelProps) {

  if (loading) {
    return null;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">⚠️</div>
        <Heading level={3} className="mb-2 text-red-600">
          Error Loading User
        </Heading>
        <Text variant="muted" className="mb-6">
          {error}
        </Text>
        {onRetry && (
          <Button onClick={onRetry} variant="primary">
            Try Again
          </Button>
        )}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">👤</div>
        <Heading level={3} className="mb-2">
          User Not Found
        </Heading>
        <Text variant="muted">
          The requested user could not be found.
        </Text>
      </div>
    );
  }

  const formatUserRoles = (roles: string[]) => {
    if (!roles || roles.length === 0) return 'No roles assigned';
    return roles.join(', ');
  };

  return (
    <>
      <hr />

      <Text variant="muted" className='pt-4 mb-4'>
        <strong>User ID:</strong> {user && user.id}
      </Text>

      <div className="grid grid-cols-2 gap-6 pt-4">
        <AdminDetailGroup>
          <AdminDetailField
            label="Contact Information"
            value={user.email}
          />
          <AdminDetailField
            label="Roles & Permissions"
            value={formatUserRoles(user.roles)}
          />
        </AdminDetailGroup>

        <div className='text-right'>
          <AdminDetailGroup>
            <AdminDetailField
              label="Account Created"
              value={formatDateForDisplay(user.createdAt)}
            />
            <AdminDetailField
              label="Last Updated"
              value={formatDateForDisplay(user.updatedAt)}
            />
          </AdminDetailGroup>
        </div>
      </div>
    </>
  );
}